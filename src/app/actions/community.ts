'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function createThread(formData: FormData) {
    const supabase: any = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autorizado')
    }

    // Get user profile to get ampa_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id')
        .eq('id', user.id)
        .single()

    if (!profile || !('ampa_id' in profile) || !profile.ampa_id) {
        throw new Error('No tienes un AMPA asignado')
    }

    const categoryId = formData.get('categoryId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const fullContent = `${title}\n\n${content}`

    try {
        const { data: post, error } = await supabase
            .from('posts')
            .insert({
                autor_id: user.id,
                ampa_id: profile.ampa_id as string,
                contenido: fullContent,
                tipo: 'post',
                foro_categoria_id: categoryId,
                pinned: false,
                likes_count: 0,
                comentarios_count: 0
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating post:', error)
            return { error: 'Error al crear el hilo' }
        }

        revalidatePath(`/dashboard/comunidad/foros/${categoryId}`)
    } catch (e: any) {
        if (e.message === 'NEXT_REDIRECT') throw e
        return { error: e.message || 'Error desconocido' }
    }

    redirect(`/dashboard/comunidad/foros/${categoryId}`)
}

export async function addReply(formData: FormData) {
    const supabase: any = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const postId = formData.get('postId') as string
    const categoryId = formData.get('categoryId') as string
    const contenido = formData.get('content') as string

    const { error } = await supabase
        .from('comentarios')
        .insert({
            post_id: postId,
            autor_id: user.id,
            contenido
        })

    if (error) {
        console.error('Error adding reply:', error)
        throw new Error('Error al enviar la respuesta')
    }

    // NEW: Notify the post author
    const { data: post } = await supabase
        .from('posts')
        .select('autor_id, ampa_id, contenido')
        .eq('id', postId)
        .single()

    if (post && post.autor_id !== user.id) {
        // Find author of the post to notify them
        const { data: commenterProfile } = await supabase
            .from('profiles')
            .select('nombre_completo')
            .eq('id', user.id)
            .single()

        await supabase
            .from('notificaciones')
            .insert({
                perfil_id: post.autor_id,
                ampa_id: post.ampa_id,
                titulo: 'Nueva respuesta en tu hilo',
                contenido: `${commenterProfile?.nombre_completo || 'Alguien'} ha respondido a tu publicación.`,
                tipo: 'comunidad',
                enlace: `/dashboard/comunidad/foros/${categoryId}/${postId}`,
                leida: false
            })
    }

    // Increment comments count on the post
    await supabase.rpc('increment_comments_count', { post_id: postId })

    revalidatePath(`/dashboard/comunidad/foros/${categoryId}/${postId}`)
}

export async function createSocialPost(content: string, image_url?: string, video_url?: string, estado?: string, is_global: boolean = false) {
    const supabase: any = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (!profile?.ampa_id && profile?.rol !== 'admin') throw new Error('No tienes un AMPA asignado')

    const { error } = await supabase
        .from('posts')
        .insert({
            autor_id: user.id,
            ampa_id: profile.ampa_id as string,
            contenido: content,
            imagen_url: image_url || null,
            video_url: video_url || null,
            estado: estado || null,
            is_global: is_global && profile.rol === 'admin',
            tipo: 'post',
            likes_count: 0,
            comentarios_count: 0
        })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
}

export async function toggleLikeAction(postId: string) {
    const supabase: any = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    // 1. Check if already liked
    const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('perfil_id', user.id)
        .single()

    if (existingLike) {
        // Unlike
        await supabase.from('post_likes').delete().eq('id', existingLike.id)
        await supabase.rpc('decrement_likes_count', { post_id: postId })
    } else {
        // Like
        await supabase.from('post_likes').insert({ post_id: postId, perfil_id: user.id })
        await supabase.rpc('increment_likes_count', { post_id: postId })

        // Notify author
        const { data: post } = await supabase
            .from('posts')
            .select('autor_id, ampa_id, contenido')
            .eq('id', postId)
            .single()

        if (post && post.autor_id !== user.id) {
            const { data: likerProfile } = await supabase
                .from('profiles')
                .select('nombre_completo')
                .eq('id', user.id)
                .single()

            await supabase
                .from('notificaciones')
                .insert({
                    perfil_id: post.autor_id,
                    ampa_id: post.ampa_id,
                    titulo: '¡Le gusta tu post!',
                    contenido: `${likerProfile?.nombre_completo || 'Alguien'} ha reaccionado a tu publicación.`,
                    tipo: 'comunidad',
                    enlace: '/dashboard', // Or link to the post if it was in a forum
                    leida: false
                })
        }
    }

    revalidatePath('/dashboard')
}
