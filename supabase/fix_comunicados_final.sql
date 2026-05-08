-- =============================================================================
-- FIX: REPARACIÓN DE COMUNICADOS MASIVOS Y ROLES
-- =============================================================================

-- 1. Asegurar que la tabla comunicados existe con la estructura correcta
CREATE TABLE IF NOT EXISTS public.comunicados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    ampa_id UUID NOT NULL REFERENCES ampas(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'sistema',
    enlace TEXT,
    alcance INTEGER DEFAULT 0
);

-- 2. Habilitar RLS en comunicados
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

-- 3. Actualizar Políticas de comunicados (Usando el nuevo rol 'admin')
DROP POLICY IF EXISTS "Admins pueden ver sus propios comunicados" ON public.comunicados;
CREATE POLICY "Admins pueden ver sus propios comunicados"
    ON public.comunicados FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.rol = 'admin'
            AND profiles.ampa_id = comunicados.ampa_id
        )
    );

-- 4. Corregir la función enviar_comunicado_masivo (Añadiendo CREATE y corregiendo lógica)
CREATE OR REPLACE FUNCTION enviar_comunicado_masivo(
    p_ampa_id UUID,
    p_autor_id UUID,
    p_titulo TEXT,
    p_contenido TEXT,
    p_tipo TEXT DEFAULT 'sistema',
    p_enlace TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_comunicado_id UUID;
    v_count INTEGER;
BEGIN
    -- 1. Contar destinatarios (todos los perfiles en este AMPA)
    SELECT count(*) INTO v_count FROM profiles WHERE ampa_id = p_ampa_id;

    -- 2. Registrar el comunicado en el historial
    INSERT INTO comunicados (ampa_id, autor_id, titulo, contenido, tipo, enlace, alcance)
    VALUES (p_ampa_id, p_autor_id, p_titulo, p_contenido, p_tipo, p_enlace, v_count)
    RETURNING id INTO v_comunicado_id;

    -- 3. Insertar las notificaciones individuales para que aparezcan en el panel de cada usuario
    INSERT INTO notificaciones (perfil_id, ampa_id, titulo, contenido, tipo, enlace)
    SELECT id, p_ampa_id, p_titulo, p_contenido, p_tipo, p_enlace
    FROM profiles
    WHERE ampa_id = p_ampa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION enviar_comunicado_masivo(UUID, UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION enviar_comunicado_masivo(UUID, UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- 6. Reparar políticas de notificaciones (por si acaso)
DROP POLICY IF EXISTS "usuarios ven sus propias notificaciones" ON public.notificaciones;
CREATE POLICY "usuarios ven sus propias notificaciones" ON public.notificaciones FOR SELECT TO authenticated
USING (perfil_id = auth.uid());
