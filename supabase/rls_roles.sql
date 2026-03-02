-- =============================================================================
-- AMPA Connect — SQL ESENCIAL + NOTIFICACIONES
-- =============================================================================

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
