export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            ampas: {
                Row: {
                    id: string
                    created_at: string
                    nombre: string
                    slug: string
                    logo_url: string | null
                    descripcion: string | null
                    plan: 'basico' | 'estandar' | 'premium'
                    color_primario: string | null
                    colegio_nombre: string | null
                    ciudad: string | null
                    activo: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    nombre: string
                    slug: string
                    logo_url?: string | null
                    descripcion?: string | null
                    plan?: 'basico' | 'estandar' | 'premium'
                    color_primario?: string | null
                    colegio_nombre?: string | null
                    ciudad?: string | null
                    activo?: boolean
                }
                Update: Partial<Database['public']['Tables']['ampas']['Insert']>
            }
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    email: string
                    nombre_completo: string | null
                    avatar_url: string | null
                    rol: 'admin' | 'user'
                    ampa_id: string | null
                    hijos: Json | null
                    bio: string | null
                    telefono: string | null
                    onboarding_completado: boolean
                }
                Insert: {
                    id: string
                    created_at?: string
                    updated_at?: string
                    email: string
                    nombre_completo?: string | null
                    avatar_url?: string | null
                    rol?: 'admin' | 'user'
                    ampa_id?: string | null
                    hijos?: Json | null
                    bio?: string | null
                    telefono?: string | null
                    onboarding_completado?: boolean
                }
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>
            }
            posts: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    autor_id: string
                    ampa_id: string
                    contenido: string
                    imagen_url: string | null
                    tipo: 'post' | 'anuncio' | 'evento'
                    likes_count: number
                    comentarios_count: number
                    foro_categoria_id: string | null
                    grupo_id: string | null
                    pinned: boolean
                    video_url: string | null
                    estado: string | null
                    is_global: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    autor_id: string
                    ampa_id: string
                    contenido: string
                    imagen_url?: string | null
                    tipo?: 'post' | 'anuncio' | 'evento'
                    likes_count?: number
                    comentarios_count?: number
                    foro_categoria_id?: string | null
                    grupo_id?: string | null
                    pinned?: boolean
                    video_url?: string | null
                    estado?: string | null
                    is_global?: boolean
                }
                Update: Partial<Database['public']['Tables']['posts']['Insert']>
            }
            recursos: {
                Row: {
                    id: string
                    created_at: string
                    ampa_id: string | null
                    titulo: string
                    descripcion: string | null
                    tipo: 'articulo' | 'pdf' | 'video' | 'infografia' | 'guia'
                    archivo_url: string | null
                    imagen_url: string | null
                    tags: string[] | null
                    etapa_educativa: string[] | null
                    publico: boolean
                    autor_nombre: string | null
                    destacado: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    ampa_id?: string | null
                    titulo: string
                    descripcion?: string | null
                    tipo?: 'articulo' | 'pdf' | 'video' | 'infografia' | 'guia'
                    archivo_url?: string | null
                    imagen_url?: string | null
                    tags?: string[] | null
                    etapa_educativa?: string[] | null
                    publico?: boolean
                    autor_nombre?: string | null
                    destacado?: boolean
                }
                Update: Partial<Database['public']['Tables']['recursos']['Insert']>
            }
            eventos: {
                Row: {
                    id: string
                    created_at: string
                    ampa_id: string
                    titulo: string
                    descripcion: string | null
                    fecha_inicio: string
                    fecha_fin: string | null
                    lugar: string | null
                    tipo: 'presencial' | 'online' | 'hibrido'
                    embed_url: string | null
                    max_asistentes: number | null
                    imagen_url: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    ampa_id: string
                    titulo: string
                    descripcion?: string | null
                    fecha_inicio: string
                    fecha_fin?: string | null
                    lugar?: string | null
                    tipo?: 'presencial' | 'online' | 'hibrido'
                    embed_url?: string | null
                    max_asistentes?: number | null
                    imagen_url?: string | null
                }
                Update: Partial<Database['public']['Tables']['eventos']['Insert']>
            }
            invitaciones: {
                Row: {
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
                Insert: {
                    id?: string
                    created_at?: string
                    ampa_id: string
                    codigo?: string
                    email_destino?: string | null
                    creado_por: string
                    usado?: boolean
                    usado_por?: string | null
                    expira_at?: string | null
                }
                Update: Partial<Database['public']['Tables']['invitaciones']['Insert']>
            }
            comentarios: {
                Row: {
                    id: string
                    created_at: string
                    post_id: string
                    autor_id: string
                    contenido: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    post_id: string
                    autor_id: string
                    contenido: string
                }
                Update: Partial<Database['public']['Tables']['comentarios']['Insert']>
            }
            asistencias_eventos: {
                Row: {
                    id: string
                    created_at: string
                    evento_id: string
                    perfil_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    evento_id: string
                    perfil_id: string
                }
                Update: Partial<Database['public']['Tables']['asistencias_eventos']['Insert']>
            }
            encuestas: {
                Row: {
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
                Insert: {
                    id?: string
                    created_at?: string
                    ampa_id: string
                    creador_id: string
                    pregunta: string
                    descripcion?: string | null
                    termina_at?: string | null
                    activa?: boolean
                    anonima?: boolean
                }
                Update: Partial<Database['public']['Tables']['encuestas']['Insert']>
            }
            encuesta_opciones: {
                Row: {
                    id: string
                    encuesta_id: string
                    texto: string
                    votos_count: number
                }
                Insert: {
                    id?: string
                    encuesta_id: string
                    texto: string
                    votos_count?: number
                }
                Update: Partial<Database['public']['Tables']['encuesta_opciones']['Insert']>
            }
            encuesta_votos: {
                Row: {
                    id: string
                    created_at: string
                    encuesta_id: string
                    opcion_id: string
                    perfil_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    encuesta_id: string
                    opcion_id: string
                    perfil_id: string
                }
                Update: Partial<Database['public']['Tables']['encuesta_votos']['Insert']>
            }
            notificaciones: {
                Row: {
                    id: string
                    created_at: string
                    perfil_id: string | null
                    ampa_id: string
                    titulo: string
                    contenido: string
                    leida: boolean
                    tipo: 'evento' | 'votacion' | 'comunidad' | 'sistema'
                    enlace: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    perfil_id?: string | null
                    ampa_id: string
                    titulo: string
                    contenido: string
                    leida?: boolean
                    tipo: 'evento' | 'votacion' | 'comunidad' | 'sistema'
                    enlace?: string | null
                }
                Update: Partial<Database['public']['Tables']['notificaciones']['Insert']>
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: {
            rol_usuario: 'admin' | 'user'
            plan_ampa: 'basico' | 'estandar' | 'premium'
        }
    }
}

// Tipos derivados útiles
export type Ampa = Database['public']['Tables']['ampas']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Recurso = Database['public']['Tables']['recursos']['Row']
export type Evento = Database['public']['Tables']['eventos']['Row']
export type Invitacion = Database['public']['Tables']['invitaciones']['Row']

export type ProfileConAmpa = Profile & { ampa: Ampa | null }
