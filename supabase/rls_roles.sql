-- =============================================================================
-- AMPA Connect — SQL ESENCIAL (AMPAs, Perfiles e Invitaciones)
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
-- Si esta tabla no existe, comenta estas líneas
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
