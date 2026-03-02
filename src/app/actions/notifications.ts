'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function markAsRead(notificationId: string) {
    const supabase: any = await createClient()
    const { error } = await (supabase.from('notificaciones' as any) as any)
        .update({ leida: true })
        .eq('id', notificationId)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard')
}

export async function markAllAsRead() {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase.from('notificaciones' as any) as any)
        .update({ leida: true })
        .eq('perfil_id', user.id)
        .eq('leida', false)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard')
}

export async function sendNotificationToAMPA(ampaId: string, data: {
    titulo: string
    contenido: string
    tipo: 'evento' | 'votacion' | 'comunidad' | 'sistema'
    enlace?: string
}) {
    const supabase: any = await createClient()

    // Get all profiles in this AMPA
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('ampa_id', ampaId)

    if (!profiles || profiles.length === 0) return

    const notifications = (profiles as any[]).map(profile => ({
        perfil_id: profile.id,
        ampa_id: ampaId,
        titulo: data.titulo,
        contenido: data.contenido,
        tipo: data.tipo,
        enlace: data.enlace || null,
        leida: false
    }))

    const { error } = await (supabase.from('notificaciones' as any) as any)
        .insert(notifications)

    if (error) console.error('Error sending notifications:', error)
}

export async function sendNotificationToUser(userId: string, ampaId: string, data: {
    titulo: string
    contenido: string
    tipo: 'evento' | 'votacion' | 'comunidad' | 'sistema'
    enlace?: string
}) {
    const supabase: any = await createClient()

    const { error } = await (supabase.from('notificaciones' as any) as any)
        .insert({
            perfil_id: userId,
            ampa_id: ampaId,
            titulo: data.titulo,
            contenido: data.contenido,
            tipo: data.tipo,
            enlace: data.enlace || null,
            leida: false
        })

    if (error) console.error('Error sending notification to user:', error)
}
