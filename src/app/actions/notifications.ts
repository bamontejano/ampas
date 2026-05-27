'use server'

import { adminDb, getUser } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'

export async function markAsRead(notificationId: string) {
    await adminDb.collection('notificaciones').doc(notificationId).update({ leida: true })
    revalidatePath('/dashboard')
}

export async function markAllAsRead() {
    const user = await getUser()
    if (!user) return

    const snapshot = await adminDb.collection('notificaciones')
        .where('perfil_id', '==', user.uid)
        .where('leida', '==', false)
        .get()

    if (snapshot.empty) return

    const batch = adminDb.batch()
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { leida: true })
    })

    await batch.commit()
    revalidatePath('/dashboard')
}

export async function sendNotificationToAMPA(ampaId: string, data: {
    titulo: string
    contenido: string
    tipo: 'evento' | 'votacion' | 'comunidad' | 'sistema'
    enlace?: string
}) {
    if (!ampaId) return

    const snapshot = await adminDb.collection('profiles')
        .where('ampa_id', '==', ampaId)
        .where('rol', '==', 'admin')
        .get()

    if (snapshot.empty) return

    const batch = adminDb.batch()
    snapshot.docs.forEach(doc => {
        const notifRef = adminDb.collection('notificaciones').doc()
        batch.set(notifRef, {
            id: notifRef.id,
            perfil_id: doc.id,
            ampa_id: ampaId,
            titulo: data.titulo,
            contenido: data.contenido,
            tipo: data.tipo,
            enlace: data.enlace || null,
            leida: false,
            created_at: new Date().toISOString()
        })
    })

    try {
        await batch.commit()
    } catch (error) {
        console.error('Error sending notifications:', error)
    }
}

export async function sendNotificationToUser(userId: string, ampaId: string, data: {
    titulo: string
    contenido: string
    tipo: 'evento' | 'votacion' | 'comunidad' | 'sistema'
    enlace?: string
}) {
    try {
        const notifRef = adminDb.collection('notificaciones').doc()
        await notifRef.set({
            id: notifRef.id,
            perfil_id: userId,
            ampa_id: ampaId,
            titulo: data.titulo,
            contenido: data.contenido,
            tipo: data.tipo,
            enlace: data.enlace || null,
            leida: false,
            created_at: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error sending notification to user:', error)
    }
}
