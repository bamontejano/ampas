-- Tabla para el historial de comunicados enviados por los administradores
CREATE TABLE IF NOT EXISTS comunicados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    ampa_id UUID NOT NULL REFERENCES ampas(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'sistema',
    enlace TEXT,
    alcance INTEGER DEFAULT 0 -- Número de personas a las que se envió
);

-- Habilitar RLS
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Admins pueden ver sus propios comunicados"
    ON comunicados FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.rol IN ('admin_ampa', 'superadmin', 'junta'))
        AND profiles.ampa_id = comunicados.ampa_id
    ));

-- Actualizar la función para registrar en el historial
OR REPLACE FUNCTION enviar_comunicado_masivo(
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
    -- 1. Contar destinatarios
    SELECT count(*) INTO v_count FROM profiles WHERE ampa_id = p_ampa_id;

    -- 2. Registrar el comunicado en el historial
    INSERT INTO comunicados (ampa_id, autor_id, titulo, contenido, tipo, enlace, alcance)
    VALUES (p_ampa_id, p_autor_id, p_titulo, p_contenido, p_tipo, p_enlace, v_count)
    RETURNING id INTO v_comunicado_id;

    -- 3. Insertar las notificaciones individuales
    INSERT INTO notificaciones (perfil_id, ampa_id, titulo, contenido, tipo, enlace)
    SELECT id, p_ampa_id, p_titulo, p_contenido, p_tipo, p_enlace
    FROM profiles
    WHERE ampa_id = p_ampa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos de ejecución actualizados
GRANT EXECUTE ON FUNCTION enviar_comunicado_masivo(UUID, UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION enviar_comunicado_masivo(UUID, UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;
