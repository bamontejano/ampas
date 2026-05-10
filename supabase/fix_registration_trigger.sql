-- ─── CORRECCIÓN DE ERROR DE REGISTRO (TRIGGER) ──────────────────────────────
-- Este script corrige el error "database error saving new user" al asegurar
-- que el trigger de creación de perfil use los nuevos roles (admin/user).

-- 1. Asegurar que el rol por defecto en la tabla profiles sea 'user'
-- Esto evita fallos si el trigger no especifica un rol.
ALTER TABLE public.profiles ALTER COLUMN rol SET DEFAULT 'user';

-- 2. Redefinir la función del trigger para que sea compatible con la nueva estructura
-- Usamos SECURITY DEFINER para que pueda insertar en la tabla de perfiles.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre_completo, rol, onboarding_completado)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'nombre_completo', ''),
    'user', -- Rol inicial siempre 'user'. Si hay código, el RPC lo actualizará a 'admin' si procede.
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asegurar que el trigger esté vinculado a auth.users
-- Primero intentamos eliminarlo por si tiene un nombre estándar diferente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Notificación de éxito
DO $$ 
BEGIN 
    RAISE NOTICE 'Trigger de registro actualizado correctamente. Rol por defecto: user.';
END $$;
