'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createResource(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No autorizado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (!profile || profile.rol !== 'admin') {
        throw new Error('No tienes permisos para crear recursos')
    }

    const titulo = formData.get('titulo') as string
    const descripcion = formData.get('descripcion') as string
    const tipo = formData.get('tipo') as any
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim())
    const etapas = (formData.get('etapas') as string)?.split(',').map(t => t.trim())
    const imagen_url = formData.get('imagen_url') as string
    const archivo_url = formData.get('archivo_url') as string
    const destacado = formData.get('destacado') === 'true'

    const { error } = await supabase
        .from('recursos')
        .insert({
            ampa_id: profile.ampa_id,
            titulo,
            descripcion,
            tipo,
            tags,
            etapa_educativa: etapas,
            imagen_url,
            archivo_url,
            destacado,
            publico: true // Por defecto
        })

    if (error) {
        console.error('Error creating resource:', error)
        throw new Error('Error al crear el recurso')
    }

    revalidatePath('/dashboard/recursos')
}

export async function deleteResource(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No autorizado')

    // Optional: check permissions again

    const { error } = await supabase
        .from('recursos')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting resource:', error)
        throw new Error('Error al eliminar el recurso')
    }

    revalidatePath('/dashboard/recursos')
}
