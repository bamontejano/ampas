-- =============================================================================
-- AMPA Connect — Migración: Subdominio único por AMPA
-- =============================================================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Asegurar que el slug sea único (necesario para subdominios)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ampas_slug_unique'
    ) THEN
        ALTER TABLE public.ampas ADD CONSTRAINT ampas_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- 2. Crear índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_ampas_slug ON public.ampas (slug);

-- 3. Verificar que no haya slugs duplicados (informativo)
-- SELECT slug, COUNT(*) FROM ampas GROUP BY slug HAVING COUNT(*) > 1;
