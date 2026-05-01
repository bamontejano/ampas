-- =============================================================================
-- AMPA Connect — SCRIPT DE CORRECCIÓN DE SEGURIDAD (RLS) v3
-- =============================================================================
-- Este script activa RLS en las tablas que existen y define sus políticas.
-- Si una tabla no existe, simplemente saltará esa parte para evitar errores.

DO $$ 
BEGIN
    -- 1. Habilitar RLS en tablas (Solo si existen)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comentarios') THEN
        ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recursos') THEN
        ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'eventos') THEN
        ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asistencias_eventos') THEN
        ALTER TABLE public.asistencias_eventos ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encuestas') THEN
        ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encuesta_opciones') THEN
        ALTER TABLE public.encuesta_opciones ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encuesta_votos') THEN
        ALTER TABLE public.encuesta_votos ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. POLÍTICAS PARA: posts
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
        DROP POLICY IF EXISTS "Usuarios ven posts de su ampa" ON posts;
        CREATE POLICY "Usuarios ven posts de su ampa" ON posts FOR SELECT TO authenticated
        USING (ampa_id = get_my_ampa_id() OR get_my_rol() = 'superadmin');

        DROP POLICY IF EXISTS "Admins gestionan posts de su ampa" ON posts;
        CREATE POLICY "Admins gestionan posts de su ampa" ON posts FOR ALL TO authenticated
        USING (
          (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta')) 
          OR get_my_rol() = 'superadmin'
        );
    END IF;
END $$;

-- 3. POLÍTICAS PARA: eventos
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'eventos') THEN
        DROP POLICY IF EXISTS "Usuarios ven eventos de su ampa" ON eventos;
        CREATE POLICY "Usuarios ven eventos de su ampa" ON eventos FOR SELECT TO authenticated
        USING (ampa_id = get_my_ampa_id() OR get_my_rol() = 'superadmin');

        DROP POLICY IF EXISTS "Admins gestionan eventos de su ampa" ON eventos;
        CREATE POLICY "Admins gestionan eventos de su ampa" ON eventos FOR ALL TO authenticated
        USING (
          (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta')) 
          OR get_my_rol() = 'superadmin'
        );
    END IF;
END $$;

-- 4. POLÍTICAS PARA: recursos
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recursos') THEN
        DROP POLICY IF EXISTS "Usuarios ven recursos de su ampa o publicos" ON recursos;
        CREATE POLICY "Usuarios ven recursos de su ampa o publicos" ON recursos FOR SELECT TO authenticated
        USING (ampa_id = get_my_ampa_id() OR publico = true OR get_my_rol() = 'superadmin');

        DROP POLICY IF EXISTS "Admins gestionan recursos" ON recursos;
        CREATE POLICY "Admins gestionan recursos" ON recursos FOR ALL TO authenticated
        USING (
          (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta')) 
          OR get_my_rol() = 'superadmin'
        );
    END IF;
END $$;

-- 5. POLÍTICAS PARA: comentarios
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comentarios') THEN
        DROP POLICY IF EXISTS "Usuarios ven comentarios de posts visibles" ON comentarios;
        CREATE POLICY "Usuarios ven comentarios de posts visibles" ON comentarios FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = comentarios.post_id 
            AND (posts.ampa_id = get_my_ampa_id() OR get_my_rol() = 'superadmin')
          )
        );

        DROP POLICY IF EXISTS "Usuarios crean sus propios comentarios" ON comentarios;
        CREATE POLICY "Usuarios crean sus propios comentarios" ON comentarios FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = autor_id);

        DROP POLICY IF EXISTS "Usuarios eliminan sus propios comentarios o admins" ON comentarios;
        CREATE POLICY "Usuarios eliminan sus propios comentarios o admins" ON comentarios FOR DELETE TO authenticated
        USING (
          auth.uid() = autor_id 
          OR get_my_rol() = 'superadmin'
          OR EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = comentarios.post_id 
            AND posts.ampa_id = get_my_ampa_id() 
            AND get_my_rol() IN ('admin_ampa', 'junta')
          )
        );
    END IF;
END $$;

-- 6. POLÍTICAS PARA: encuestas
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encuestas') THEN
        DROP POLICY IF EXISTS "Usuarios ven encuestas de su ampa" ON encuestas;
        CREATE POLICY "Usuarios ven encuestas de su ampa" ON encuestas FOR SELECT TO authenticated
        USING (ampa_id = get_my_ampa_id() OR get_my_rol() = 'superadmin');

        DROP POLICY IF EXISTS "Admins gestionan encuestas" ON encuestas;
        CREATE POLICY "Admins gestionan encuestas" ON encuestas FOR ALL TO authenticated
        USING (
          (ampa_id = get_my_ampa_id() AND get_my_rol() IN ('admin_ampa', 'junta')) 
          OR get_my_rol() = 'superadmin'
        );
    END IF;
END $$;

-- 7. POLÍTICAS PARA: encuesta_opciones
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encuesta_opciones') THEN
        DROP POLICY IF EXISTS "Usuarios ven opciones de encuestas visibles" ON encuesta_opciones;
        CREATE POLICY "Usuarios ven opciones de encuestas visibles" ON encuesta_opciones FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM encuestas 
            WHERE encuestas.id = encuesta_opciones.encuesta_id 
            AND (encuestas.ampa_id = get_my_ampa_id() OR get_my_rol() = 'superadmin')
          )
        );
    END IF;
END $$;

-- 8. POLÍTICAS PARA: encuesta_votos
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'encuesta_votos') THEN
        DROP POLICY IF EXISTS "Usuarios ven sus propios votos o admins" ON encuesta_votos;
        CREATE POLICY "Usuarios ven sus propios votos o admins" ON encuesta_votos FOR SELECT TO authenticated
        USING (
          perfil_id = auth.uid() 
          OR get_my_rol() = 'superadmin'
          OR EXISTS (
            SELECT 1 FROM encuestas 
            WHERE encuestas.id = encuesta_votos.encuesta_id 
            AND encuestas.ampa_id = get_my_ampa_id() 
            AND get_my_rol() IN ('admin_ampa', 'junta')
          )
        );

        DROP POLICY IF EXISTS "Usuarios votan" ON encuesta_votos;
        CREATE POLICY "Usuarios votan" ON encuesta_votos FOR INSERT TO authenticated
        WITH CHECK (perfil_id = auth.uid());
    END IF;
END $$;

-- 9. POLÍTICAS PARA: asistencias_eventos
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asistencias_eventos') THEN
        DROP POLICY IF EXISTS "Usuarios ven sus propias asistencias o admins" ON asistencias_eventos;
        CREATE POLICY "Usuarios ven sus propias asistencias o admins" ON asistencias_eventos FOR SELECT TO authenticated
        USING (
          perfil_id = auth.uid() 
          OR get_my_rol() = 'superadmin'
          OR EXISTS (
            SELECT 1 FROM eventos 
            WHERE eventos.id = asistencias_eventos.evento_id 
            AND eventos.ampa_id = get_my_ampa_id() 
            AND get_my_rol() IN ('admin_ampa', 'junta')
          )
        );

        DROP POLICY IF EXISTS "Usuarios se apuntan a eventos" ON asistencias_eventos;
        CREATE POLICY "Usuarios se apuntan a eventos" ON asistencias_eventos FOR INSERT TO authenticated
        WITH CHECK (perfil_id = auth.uid());

        DROP POLICY IF EXISTS "Usuarios cancelan su asistencia" ON asistencias_eventos;
        CREATE POLICY "Usuarios cancelan su asistencia" ON asistencias_eventos FOR DELETE TO authenticated
        USING (perfil_id = auth.uid());
    END IF;
END $$;
