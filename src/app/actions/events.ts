'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { sendNotificationToAMPA } from './notifications'

export async function registerForEvent(eventoId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No estás autenticado')

    // 1. Verificar aforo
    const { data: evento, error: eventoError } = await supabase
        .from('eventos' as any)
        .select('max_asistentes, asistencias_eventos(count)')
        .eq('id', eventoId)
        .single()

    if (eventoError || !evento) throw new Error('Evento no encontrado')

    const asistentesActuales = (evento as any).asistencias_eventos[0].count
    if (evento.max_asistentes && asistentesActuales >= evento.max_asistentes) {
        throw new Error('Lo sentimos, el aforo para este evento está completo')
    }

    // 2. Insertar asistencia
    const { error } = await supabase
        .from('asistencias_eventos' as any)
        .insert({
            evento_id: eventoId,
            perfil_id: user.id
        } as any)

    if (error) {
        if (error.code === '23505') {
            throw new Error('Ya estás registrado para este evento')
        }
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/eventos')
}

export async function unregisterFromEvent(eventoId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No estás autenticado')

    const { error } = await supabase
        .from('asistencias_eventos' as any)
        .delete()
        .eq('evento_id', eventoId)
        .eq('perfil_id', user.id)

    if (error) throw new Error('No se pudo cancelar la asistencia')

    revalidatePath('/dashboard/eventos')
}

export async function createEvent(formData: any) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    // Verificar rol
    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('rol, ampa_id')
        .eq('id', user.id)
        .single()

    const profile = profileRaw as any

    if (!profile || (profile.rol !== 'junta' && profile.rol !== 'admin_ampa')) {
        throw new Error('No tienes permisos para crear eventos')
    }

    const { error } = await supabase
        .from('eventos' as any)
        .insert({
            ampa_id: profile.ampa_id,
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            lugar: formData.lugar,
            tipo: formData.tipo,
            imagen_url: formData.imagen_url,
            max_asistentes: formData.max_asistentes ? parseInt(formData.max_asistentes) : null
        } as any)

    if (error) throw new Error(error.message)

    await sendNotificationToAMPA(profile.ampa_id as string, {
        titulo: 'Nuevo evento programado',
        contenido: `Se ha publicado: ${formData.titulo}`,
        tipo: 'evento',
        enlace: '/dashboard/eventos'
    })

    revalidatePath('/dashboard/eventos')
}
