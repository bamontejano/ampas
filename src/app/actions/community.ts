'use server'

import { adminDb, getUser } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as admin from 'firebase-admin'

export async function deleteThread(postId: string, categoryId: string) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    const postDoc = await adminDb.collection('posts').doc(postId).get()
    if (!postDoc.exists) throw new Error('Hilo no encontrado')
    const post = postDoc.data()!

    // Only the author or an admin can delete
    const isAuthor = post.autor_id === user.uid
    const isAdmin = profile?.rol === 'admin'
    if (!isAuthor && !isAdmin) throw new Error('No tienes permiso para borrar este hilo')

    // Delete the post and all its comments in a batch
    const batch = adminDb.batch()
    batch.delete(adminDb.collection('posts').doc(postId))

    const commentsSnapshot = await adminDb.collection('comentarios').where('post_id', '==', postId).get()
    commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref))

    const likesSnapshot = await adminDb.collection('post_likes').where('post_id', '==', postId).get()
    likesSnapshot.docs.forEach(doc => batch.delete(doc.ref))

    await batch.commit()

    revalidatePath(`/dashboard/comunidad/foros/${categoryId}`)
    redirect(`/dashboard/comunidad/foros/${categoryId}`)
}

export async function createThread(formData: FormData) {
    const user = await getUser()
    if (!user) {
        throw new Error('No autorizado')
    }

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (!profile || !('ampa_id' in profile) || !profile.ampa_id) {
        throw new Error('No tienes un AMPA asignado')
    }

    const categoryId = formData.get('categoryId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const fullContent = `${title}\n\n${content}`

    try {
        const newRef = adminDb.collection('posts').doc()
        await newRef.set({
            id: newRef.id,
            autor_id: user.uid,
            ampa_id: profile.ampa_id,
            contenido: fullContent,
            tipo: 'post',
            foro_categoria_id: categoryId,
            pinned: false,
            likes_count: 0,
            comentarios_count: 0,
            created_at: new Date().toISOString()
        })

        revalidatePath(`/dashboard/comunidad/foros/${categoryId}`)
    } catch (e: any) {
        if (e.message === 'NEXT_REDIRECT') throw e
        return { error: e.message || 'Error desconocido' }
    }

    redirect(`/dashboard/comunidad/foros/${categoryId}`)
}

export async function addReply(formData: FormData) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const postId = formData.get('postId') as string
    const categoryId = formData.get('categoryId') as string
    const contenido = formData.get('content') as string

    const postRef = adminDb.collection('posts').doc(postId)
    
    await adminDb.runTransaction(async (t) => {
        const postDoc = await t.get(postRef)
        if (!postDoc.exists) throw new Error('Post no encontrado')
        
        const newReplyRef = adminDb.collection('comentarios').doc()
        t.set(newReplyRef, {
            id: newReplyRef.id,
            post_id: postId,
            autor_id: user.uid,
            contenido,
            created_at: new Date().toISOString()
        })
        
        t.update(postRef, {
            comentarios_count: admin.firestore.FieldValue.increment(1)
        })
    })

    // Notify the post author outside transaction
    try {
        const postDoc = await postRef.get()
        const post = postDoc.data()
        
        if (post && post.autor_id !== user.uid) {
            const commenterProfileDoc = await adminDb.collection('profiles').doc(user.uid).get()
            const commenterProfile = commenterProfileDoc.data()

            const notifRef = adminDb.collection('notificaciones').doc()
            await notifRef.set({
                id: notifRef.id,
                perfil_id: post.autor_id,
                ampa_id: post.ampa_id,
                titulo: 'Nueva respuesta en tu hilo',
                contenido: `${commenterProfile?.nombre_completo || 'Alguien'} ha respondido a tu publicación.`,
                tipo: 'comunidad',
                enlace: `/dashboard/comunidad/foros/${categoryId}/${postId}`,
                leida: false,
                created_at: new Date().toISOString()
            })
        }
    } catch (error) {
        console.error('Error notifying author:', error)
    }

    revalidatePath(`/dashboard/comunidad/foros/${categoryId}/${postId}`)
}

export async function createSocialPost(content: string, image_url?: string, video_url?: string, estado?: string, is_global: boolean = false) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (!profile?.ampa_id && profile?.rol !== 'admin') throw new Error('No tienes un AMPA asignado')

    const newRef = adminDb.collection('posts').doc()
    await newRef.set({
        id: newRef.id,
        autor_id: user.uid,
        ampa_id: profile.ampa_id,
        contenido: content,
        imagen_url: image_url || null,
        video_url: video_url || null,
        estado: estado || null,
        is_global: is_global && profile.rol === 'admin',
        tipo: 'post',
        likes_count: 0,
        comentarios_count: 0,
        created_at: new Date().toISOString()
    })

    revalidatePath('/dashboard')
}

export async function toggleLikeAction(postId: string) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const likeId = `${postId}_${user.uid}`
    const likeRef = adminDb.collection('post_likes').doc(likeId)
    const postRef = adminDb.collection('posts').doc(postId)

    let isLike = false

    await adminDb.runTransaction(async (t) => {
        const likeDoc = await t.get(likeRef)
        const postDoc = await t.get(postRef)
        
        if (!postDoc.exists) throw new Error('Post no encontrado')

        if (likeDoc.exists) {
            // Unlike
            t.delete(likeRef)
            t.update(postRef, {
                likes_count: admin.firestore.FieldValue.increment(-1)
            })
            isLike = false
        } else {
            // Like
            t.set(likeRef, {
                id: likeId,
                post_id: postId,
                perfil_id: user.uid,
                created_at: new Date().toISOString()
            })
            t.update(postRef, {
                likes_count: admin.firestore.FieldValue.increment(1)
            })
            isLike = true
        }
    })

    if (isLike) {
        try {
            const postDoc = await postRef.get()
            const post = postDoc.data()
            
            if (post && post.autor_id !== user.uid) {
                const likerProfileDoc = await adminDb.collection('profiles').doc(user.uid).get()
                const likerProfile = likerProfileDoc.data()

                const notifRef = adminDb.collection('notificaciones').doc()
                await notifRef.set({
                    id: notifRef.id,
                    perfil_id: post.autor_id,
                    ampa_id: post.ampa_id,
                    titulo: '¡Le gusta tu post!',
                    contenido: `${likerProfile?.nombre_completo || 'Alguien'} ha reaccionado a tu publicación.`,
                    tipo: 'comunidad',
                    enlace: '/dashboard',
                    leida: false,
                    created_at: new Date().toISOString()
                })
            }
        } catch (error) {
            console.error('Error notifying author of like:', error)
        }
    }

    revalidatePath('/dashboard')
}
