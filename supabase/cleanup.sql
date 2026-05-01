-- ─── LIMPIEZA DE DATOS DE EJEMPLO ─────────────────────────────────────────────
-- Este script elimina todos los datos de las tablas de comunidad para dejar el
-- sistema listo para datos reales. Preserva las tablas de AMPAs y Perfiles.

-- 1. Eliminar participaciones (votos, asistencias, comentarios)
TRUNCATE public.encuesta_votos CASCADE;
TRUNCATE public.asistencias_eventos CASCADE;
TRUNCATE public.comentarios CASCADE;

-- 2. Eliminar contenidos principales
TRUNCATE public.posts CASCADE;
TRUNCATE public.recursos CASCADE;
TRUNCATE public.eventos CASCADE;
TRUNCATE public.encuestas CASCADE;
TRUNCATE public.notificaciones CASCADE;

-- 3. (Opcional) Eliminar invitaciones no usadas
-- DELETE FROM public.invitaciones WHERE usado = false;

-- 4. Registro de limpieza
DO $$ 
BEGIN 
    RAISE NOTICE 'Base de datos de contenido limpiada correctamente. Preservados Perfiles y AMPAs.';
END $$;
