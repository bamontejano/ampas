// Firestore native types — replaces the old Supabase-style database.ts

export type Plan = 'basico' | 'estandar' | 'premium'
export type Rol = 'admin' | 'user'
export type TipoPost = 'post' | 'anuncio' | 'evento'
export type TipoRecurso = 'articulo' | 'pdf' | 'video' | 'infografia' | 'guia'
export type TipoEvento = 'presencial' | 'online' | 'hibrido'
export type TipoNotificacion = 'evento' | 'votacion' | 'comunidad' | 'sistema'

export interface Ampa {
  id: string
  created_at: string
  nombre: string
  slug: string
  logo_url: string | null
  descripcion: string | null
  plan: Plan
  color_primario: string | null
  colegio_nombre: string | null
  ciudad: string | null
  activo: boolean
}

export interface Profile {
  id: string
  created_at: string
  updated_at?: string
  email: string
  nombre_completo: string | null
  avatar_url: string | null
  rol: Rol
  ampa_id: string | null
  hijos: unknown | null
  bio: string | null
  telefono: string | null
  onboarding_completado: boolean
  estado_suscripcion?: 'activo' | 'pendiente'
  suscripcion_hasta?: string | null
}

export interface Post {
  id: string
  created_at: string
  updated_at?: string
  autor_id: string
  ampa_id: string
  contenido: string
  imagen_url: string | null
  video_url: string | null
  estado: string | null
  tipo: TipoPost
  likes_count: number
  comentarios_count: number
  foro_categoria_id: string | null
  grupo_id: string | null
  pinned: boolean
  is_global: boolean
}

export interface Recurso {
  id: string
  created_at: string
  ampa_id: string | null
  titulo: string
  descripcion: string | null
  tipo: TipoRecurso
  archivo_url: string | null
  imagen_url: string | null
  tags: string[] | null
  etapa_educativa: string[] | null
  publico: boolean
  autor_nombre: string | null
  destacado: boolean
}

export interface Evento {
  id: string
  created_at: string
  ampa_id: string
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string | null
  lugar: string | null
  tipo: TipoEvento
  embed_url: string | null
  max_asistentes: number | null
  imagen_url: string | null
}

export interface Invitacion {
  id: string
  created_at: string
  ampa_id: string
  codigo: string
  email_destino: string | null
  creado_por: string
  usado: boolean
  usado_por: string | null
  expira_at: string | null
}

export interface Comentario {
  id: string
  created_at: string
  post_id: string
  autor_id: string
  contenido: string
}

export interface AsistenciaEvento {
  id: string
  created_at: string
  evento_id: string
  perfil_id: string
}

export interface Encuesta {
  id: string
  created_at: string
  ampa_id: string
  creador_id: string
  pregunta: string
  descripcion: string | null
  termina_at: string | null
  activa: boolean
  anonima: boolean
}

export interface EncuestaOpcion {
  id: string
  encuesta_id: string
  texto: string
  votos_count: number
}

export interface EncuestaVoto {
  id: string
  created_at: string
  encuesta_id: string
  opcion_id: string
  perfil_id: string
}

export interface Notificacion {
  id: string
  created_at: string
  perfil_id: string | null
  ampa_id: string
  titulo: string
  contenido: string
  leida: boolean
  tipo: TipoNotificacion
  enlace: string | null
}

export interface AmpaApp {
  id: string
  created_at: string
  ampa_id: string
  nombre: string
  descripcion: string
  url_acceso: string
  icono: string
  color: string
}

export type ProfileConAmpa = Profile & { ampa: Ampa | null }
