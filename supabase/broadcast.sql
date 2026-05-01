-- Función para enviar notificaciones masivas a todos los miembros de un AMPA
CREATE OR REPLACE FUNCTION enviar_comunicado_masivo(
    p_ampa_id UUID,
    p_titulo TEXT,
    p_contenido TEXT,
    p_tipo TEXT DEFAULT 'sistema',
    p_enlace TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insertar una notificación para cada perfil vinculado a este AMPA
    INSERT INTO notificaciones (perfil_id, ampa_id, titulo, contenido, tipo, enlace)
    SELECT id, p_ampa_id, p_titulo, p_contenido, p_tipo, p_enlace
    FROM profiles
    WHERE ampa_id = p_ampa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION enviar_comunicado_masivo(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION enviar_comunicado_masivo(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;
