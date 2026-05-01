-- =============================================================================
-- AMPA Connect — Migración: Acceso Público a Metadatos del AMPA
-- =============================================================================
-- Ejecutar en el SQL Editor de Supabase
-- Permite que los usuarios no autenticados puedan ver el nombre y el logo del
-- AMPA cuando entran en su subdominio para la página de login/registro.

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ampas') THEN
        DROP POLICY IF EXISTS "lectura publica ampas activas" ON public.ampas;
        
        -- Permitir SELECT a todos (anon y authenticated) solo si el ampa está activa
        CREATE POLICY "lectura publica ampas activas" ON public.ampas 
        FOR SELECT 
        TO public 
        USING (activo = true);
    END IF;
END $$;
