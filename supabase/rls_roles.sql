-- =============================================================================
-- AMPA Connect — SQL ESENCIAL + NOTIFICACIONES
-- =============================================================================

-- ─── PREPARACIÓN DE COLUMNAS FALTANTES ──────────────────────────────────────
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS estado_suscripcion text DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS suscripcion_hasta timestamptz;


-- ─── HELPERS ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_rol()
RETURNS TEXT AS $$
  SELECT rol FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_ampa_id()
RETURNS UUID AS $$
  SELECT ampa_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ─── TABLA: ampas ────────────────────────────────────────────────────────────
ALTER TABLE ampas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios ven su propia ampa" ON ampas;
DROP POLICY IF EXISTS "superadmin crea ampas" ON ampas;
DROP POLICY IF EXISTS "superadmin actualiza ampas" ON ampas;
DROP POLICY IF EXISTS "superadmin elimina ampas" ON ampas;

CREATE POLICY "usuarios ven su propia ampa" ON ampas FOR SELECT TO authenticated
USING (id = get_my_ampa_id() OR get_my_rol() = 'superadmin');

CREATE POLICY "superadmin crea ampas" ON ampas FOR INSERT TO authenticated
WITH CHECK (get_my_rol() = 'superadmin');

CREATE POLICY "superadmin actualiza ampas" ON ampas FOR UPDATE TO authenticated
USING (get_my_rol() = 'superadmin');

CREATE POLICY "superadmin elimina ampas" ON ampas FOR DELETE TO authenticated
USING (get_my_rol() = 'superadmin');


-- ─── TABLA: profiles ─────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura de perfiles" ON profiles;
DROP POLICY IF EXISTS "actualizacion de perfiles" ON profiles;

CREATE POLICY "lectura de perfiles" ON profiles FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR get_my_rol() = 'superadmin' 
  OR (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta'))
);

CREATE POLICY "actualizacion de perfiles" ON profiles FOR UPDATE TO authenticated
USING (
  id = auth.uid() 
  OR get_my_rol() = 'superadmin' 
  OR (ampa_id = get_my_ampa_id() AND get_my_rol() = 'admin_ampa')
);


-- ─── TABLA: invitaciones ─────────────────────────────────────────────────────
ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins leen invitaciones de su ampa" ON invitaciones;
DROP POLICY IF EXISTS "admins crean invitaciones" ON invitaciones;
DROP POLICY IF EXISTS "admins eliminan invitaciones" ON invitaciones;

CREATE POLICY "admins leen invitaciones de su ampa" ON invitaciones FOR SELECT TO authenticated
USING (get_my_rol() = 'superadmin' OR (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta')));

CREATE POLICY "admins crean invitaciones" ON invitaciones FOR INSERT TO authenticated
WITH CHECK (get_my_rol() = 'superadmin' OR (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta')));

CREATE POLICY "admins eliminan invitaciones" ON invitaciones FOR DELETE TO authenticated
USING (get_my_rol() = 'superadmin' OR (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta')));


-- ─── TABLA: notificaciones ───────────────────────────────────────────────────
-- 1. Crear la tabla (por si no existe)
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    perfil_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ampa_id UUID REFERENCES public.ampas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    leida BOOLEAN DEFAULT false NOT NULL,
    tipo TEXT CHECK (tipo IN ('evento', 'votacion', 'comunidad', 'sistema')) NOT NULL,
    enlace TEXT
);

-- 2. Activar RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
DROP POLICY IF EXISTS "usuarios ven sus propias notificaciones" ON notificaciones;
CREATE POLICY "usuarios ven sus propias notificaciones" ON notificaciones FOR SELECT TO authenticated
USING (perfil_id = auth.uid());

DROP POLICY IF EXISTS "usuarios actualizan sus propias notificaciones" ON notificaciones;
CREATE POLICY "usuarios actualizan sus propias notificaciones" ON notificaciones FOR UPDATE TO authenticated
USING (perfil_id = auth.uid()) WITH CHECK (perfil_id = auth.uid());

-- 4. Activar Realtime (Solo si no está ya activo)
-- Esto se suele hacer por interfaz, pero este SQL ayuda:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notificaciones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;
  END IF;
END $$;

-- ─── RPCs: INVITACIONES (Bypass RLS) ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_invitacion_by_codigo(p_codigo text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT row_to_json(i) INTO result
    FROM invitaciones i
    WHERE UPPER(i.codigo) = UPPER(p_codigo);
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants para que el RPC sea accesible (especialmente por anon durante registro)
GRANT EXECUTE ON FUNCTION get_invitacion_by_codigo(text) TO anon, authenticated, postgres;
GRANT EXECUTE ON FUNCTION usar_invitacion(uuid, uuid) TO anon, authenticated, postgres;
GRANT EXECUTE ON FUNCTION liberar_invitacion(uuid) TO anon, authenticated, postgres;

CREATE OR REPLACE FUNCTION usar_invitacion(p_id uuid, p_user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE invitaciones
    SET usado = true, usado_por = p_user_id
    WHERE id = p_id AND usado = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Primero elminamos las versiones anteriores para evitar conflictos en el esquema
DROP FUNCTION IF EXISTS procesar_registro_con_invitacion(text, uuid, text);
DROP FUNCTION IF EXISTS procesar_registro_con_invitacion(text, uuid, text, text);

CREATE OR REPLACE FUNCTION procesar_registro_con_invitacion(
    p_codigo text,
    p_user_id uuid,
    p_nombre_completo text,
    p_email text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    v_invitacion record;
    v_es_admin boolean;
    v_final_rol text;
    v_email text;
BEGIN
    -- 1. Buscar la invitación
    SELECT * INTO v_invitacion
    FROM invitaciones
    WHERE UPPER(codigo) = UPPER(TRIM(p_codigo))
    LIMIT 1;

    -- 2. Validaciones
    IF v_invitacion IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Código de invitación no válido o inexistente');
    END IF;

    IF v_invitacion.usado AND v_invitacion.usado_por != p_user_id THEN
        RETURN json_build_object('success', false, 'error', 'Este código de invitación ya ha sido utilizado por otro usuario');
    END IF;

    -- 3. Determinar el rol
    v_es_admin := v_invitacion.codigo LIKE 'ADMIN-%';
    v_final_rol := CASE WHEN v_es_admin THEN 'admin_ampa' ELSE 'familia' END;

    -- 4. Obtener email (del parámetro o de auth.users si es necesario)
    v_email := COALESCE(p_email, (SELECT email FROM auth.users WHERE id = p_user_id));

    IF v_email IS NULL THEN
        -- Failsafe: Si no hay email, no podemos crear el perfil por el NOT NULL. 
        -- Pero intentamos solo el update si el perfil ya existe.
        UPDATE profiles
        SET 
            ampa_id = v_invitacion.ampa_id,
            onboarding_completado = true,
            nombre_completo = COALESCE(p_nombre_completo, profiles.nombre_completo),
            rol = v_final_rol
        WHERE id = p_user_id;
    ELSE
        -- 5. INSERT o UPDATE (UPSERT)
        INSERT INTO profiles (id, ampa_id, onboarding_completado, nombre_completo, rol, email)
        VALUES (p_user_id, v_invitacion.ampa_id, true, p_nombre_completo, v_final_rol, v_email)
        ON CONFLICT (id) DO UPDATE
        SET 
            ampa_id = EXCLUDED.ampa_id,
            onboarding_completado = true,
            nombre_completo = COALESCE(p_nombre_completo, profiles.nombre_completo),
            rol = EXCLUDED.rol;
    END IF;

    -- 6. Marcar invitación como usada
    UPDATE invitaciones
    SET 
        usado = true,
        usado_por = p_user_id
    WHERE id = v_invitacion.id;

    RETURN json_build_object(
        'success', true, 
        'ampa_id', v_invitacion.ampa_id,
        'es_admin', v_es_admin,
        'rol_asignado', v_final_rol,
        'email_usado', v_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION procesar_registro_con_invitacion(text, uuid, text, text) TO anon, authenticated, postgres;

CREATE OR REPLACE FUNCTION liberar_invitacion(p_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE invitaciones
    SET usado = false, usado_por = null
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── CASCADA PARA ELIMINACIÓN DE AMPAs ───────────────────────────────────────

-- Ajustar profiles (ampa_id)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_ampa_id_fkey,
ADD CONSTRAINT profiles_ampa_id_fkey 
FOREIGN KEY (ampa_id) REFERENCES ampas(id) ON DELETE CASCADE;

-- Ajustar invitaciones (ampa_id)
ALTER TABLE invitaciones 
DROP CONSTRAINT IF EXISTS invitaciones_ampa_id_fkey,
ADD CONSTRAINT invitaciones_ampa_id_fkey 
FOREIGN KEY (ampa_id) REFERENCES ampas(id) ON DELETE CASCADE;

-- Ajustar posts (ampa_id)
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_ampa_id_fkey,
ADD CONSTRAINT posts_ampa_id_fkey 
FOREIGN KEY (ampa_id) REFERENCES ampas(id) ON DELETE CASCADE;

-- Ajustar recursos (ampa_id)
ALTER TABLE recursos 
DROP CONSTRAINT IF EXISTS recursos_ampa_id_fkey,
ADD CONSTRAINT recursos_ampa_id_fkey 
FOREIGN KEY (ampa_id) REFERENCES ampas(id) ON DELETE CASCADE;

-- Ajustar eventos (ampa_id)
ALTER TABLE eventos 
DROP CONSTRAINT IF EXISTS eventos_ampa_id_fkey,
ADD CONSTRAINT eventos_ampa_id_fkey 
FOREIGN KEY (ampa_id) REFERENCES ampas(id) ON DELETE CASCADE;
