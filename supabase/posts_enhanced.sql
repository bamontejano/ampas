-- Añadir columnas para video y estado (mood) en los posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT;

-- Actualizar comentarios de las columnas
COMMENT ON COLUMN posts.video_url IS 'URL de YouTube, Vimeo o enlace directo a video';
COMMENT ON COLUMN posts.estado IS 'Mood o estado emocional/actividad del autor';
