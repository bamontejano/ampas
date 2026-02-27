'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { sendNotificationToAMPA } from './notifications'

export async function createPoll(data: {
    pregunta: string
    descripcion?: string
    opciones: string[]
    termina_at?: string
    anonima?: boolean
}) {
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
        throw new Error('No tienes permisos para crear votaciones')
    }

    // 1. Crear la encuesta
    const { data: encuestaRaw, error: encuestaError } = await supabase
        .from('encuestas' as any)
        .insert({
            ampa_id: profile.ampa_id as string,
            creador_id: user.id,
            pregunta: data.pregunta,
            descripcion: data.descripcion,
            termina_at: data.termina_at,
            anonima: data.anonima || false
        } as any)
        .select()
        .single()

    const encuesta = encuestaRaw as any

    if (encuestaError) throw new Error(encuestaError.message)

    // 2. Crear las opciones
    const opcionesInsert = data.opciones.map(texto => ({
        encuesta_id: encuesta.id,
        texto,
        votos_count: 0
    }))

    const { error: opcionesError } = await supabase
        .from('encuesta_opciones' as any)
        .insert(opcionesInsert as any)

    if (opcionesError) throw new Error(opcionesError.message)

    await sendNotificationToAMPA(profile.ampa_id as string, {
        titulo: 'Nueva votación abierta',
        contenido: `Participa en: ${data.pregunta}`,
        tipo: 'votacion',
        enlace: '/dashboard/votaciones'
    })

    revalidatePath('/dashboard/votaciones')
}

export async function castVote(encuestaId: string, opcionId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Debes iniciar sesión para votar')

    // 1. Verificar si ya votó
    const { data: yaVoto } = await supabase
        .from('encuesta_votos' as any)
        .select('id')
        .eq('encuesta_id', encuestaId)
        .eq('perfil_id', user.id)
        .single()

    if (yaVoto) throw new Error('Ya has participado en esta votación')

    // 2. Verificar si la votación sigue activa y dentro de plazo
    const { data: encuesta, error: fetchError } = await supabase
        .from('encuestas' as any)
        .select('activa, termina_at')
        .eq('id', encuestaId)
        .single()

    if (fetchError || !encuesta) throw new Error('No se pudo encontrar la votación')

    if (!encuesta.activa) {
        throw new Error('Esta votación ha sido cerrada por la junta directiva')
    }

    if (encuesta.termina_at && new Date(encuesta.termina_at) < new Date()) {
        throw new Error('El plazo de votación para esta encuesta ha finalizado')
    }

    // 3. Registrar el voto
    const { error: votoError } = await supabase
        .from('encuesta_votos' as any)
        .insert({
            encuesta_id: encuestaId,
            opcion_id: opcionId,
            perfil_id: user.id
        } as any)

    if (votoError) throw new Error('Error al registrar tu voto. Inténtalo de nuevo.')

    // 4. Incrementar contador de la opción de forma atómica mediante RPC
    const { error: incrementError } = await (supabase as any).rpc('increment_voto_count', { row_id: opcionId })

    if (incrementError) {
        console.error('Error en RPC increment_voto_count:', incrementError)
        // Fallback manual por si el RPC no está en la DB todavía
        const { data: opcion } = await supabase
            .from('encuesta_opciones' as any)
            .select('votos_count')
            .eq('id', opcionId)
            .single()

        await (supabase.from('encuesta_opciones' as any) as any)
            .update({ votos_count: ((opcion as any)?.votos_count || 0) + 1 })
            .eq('id', opcionId)
    }

    revalidatePath('/dashboard/votaciones')
}
