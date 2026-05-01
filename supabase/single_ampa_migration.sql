-- =============================================================================
-- MIGRACIÓN A INSTANCIA ÚNICA Y SIMPLIFICACIÓN DE ROLES
-- AMPA IES CRISTO DEL ROSARIO
-- =============================================================================

-- 1. Eliminar la check constraint antigua para permitir el cambio de roles
-- La constraint existente solo permite los valores antiguos (superadmin, admin_ampa, etc.)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_rol_check;

-- 2. Mapeo de roles existentes a los nuevos 'admin' y 'user'
UPDATE public.profiles 
SET rol = CASE 
    WHEN rol IN ('superadmin', 'admin_ampa', 'junta') THEN 'admin'
    ELSE 'user'
END;

-- 3. Recrear la constraint con SOLO los nuevos valores permitidos
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_rol_check CHECK (rol IN ('admin', 'user'));

-- 3. Actualizar funciones de ayuda
CREATE OR REPLACE FUNCTION get_my_rol()
RETURNS TEXT AS $$
  SELECT rol FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Simplificar Políticas de RLS

-- TABLA: ampas (Solo habrá una, pero mantenemos la seguridad básica)
DROP POLICY IF EXISTS "usuarios ven su propia ampa" ON ampas;
DROP POLICY IF EXISTS "superadmin crea ampas" ON ampas;
DROP POLICY IF EXISTS "superadmin actualiza ampas" ON ampas;
DROP POLICY IF EXISTS "superadmin elimina ampas" ON ampas;

CREATE POLICY "acceso lectura ampa" ON ampas FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin gestiona ampa" ON ampas FOR ALL TO authenticated USING (get_my_rol() = 'admin');

-- TABLA: profiles
DROP POLICY IF EXISTS "lectura de perfiles" ON profiles;
DROP POLICY IF EXISTS "actualizacion de perfiles" ON profiles;

CREATE POLICY "lectura de perfiles" ON profiles FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR get_my_rol() = 'admin'
);

CREATE POLICY "actualizacion de perfiles" ON profiles FOR UPDATE TO authenticated
USING (
  id = auth.uid() 
  OR get_my_rol() = 'admin'
);

-- TABLA: invitaciones
DROP POLICY IF EXISTS "admins leen invitaciones de su ampa" ON invitaciones;
DROP POLICY IF EXISTS "admins crean invitaciones" ON invitaciones;
DROP POLICY IF EXISTS "admins eliminan invitaciones" ON invitaciones;

CREATE POLICY "admin gestiona invitaciones" ON invitaciones FOR ALL TO authenticated
USING (get_my_rol() = 'admin');

-- 5. Actualizar el RPC de registro
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

    -- 3. Determinar el rol (Simplificado a admin o user)
    v_es_admin := v_invitacion.codigo LIKE 'ADMIN-%';
    v_final_rol := CASE WHEN v_es_admin THEN 'admin' ELSE 'user' END;

    -- 4. Obtener email
    v_email := COALESCE(p_email, (SELECT email FROM auth.users WHERE id = p_user_id));

    -- 5. INSERT o UPDATE (UPSERT)
    INSERT INTO profiles (id, ampa_id, onboarding_completado, nombre_completo, rol, email)
    VALUES (p_user_id, v_invitacion.ampa_id, true, p_nombre_completo, v_final_rol, v_email)
    ON CONFLICT (id) DO UPDATE
    SET 
        ampa_id = EXCLUDED.ampa_id,
        onboarding_completado = true,
        nombre_completo = COALESCE(p_nombre_completo, profiles.nombre_completo),
        rol = EXCLUDED.rol;

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
        'rol_asignado', v_final_rol
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Asegurar que existe el registro del AMPA
INSERT INTO ampas (id, nombre, slug, plan, activo)
VALUES ('00000000-0000-0000-0000-000000000000', 'AMPA IES CRISTO DEL ROSARIO', 'ies-cristo-del-rosario', 'premium', true)
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre, slug = EXCLUDED.slug;
