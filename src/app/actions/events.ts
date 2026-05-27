'use server'

import { adminDb, getUser } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import { sendNotificationToAMPA } from './notifications'

export async function registerForEvent(eventoId: string) {
    const user = await getUser()
    if (!user) throw new Error('No estás autenticado')

    const eventoRef = adminDb.collection('eventos').doc(eventoId)
    const asistenciaRef = adminDb.collection('asistencias_eventos').doc(`${eventoId}_${user.uid}`)

    await adminDb.runTransaction(async (transaction) => {
        const eventoDoc = await transaction.get(eventoRef)
        if (!eventoDoc.exists) throw new Error('Evento no encontrado')
        
        const asistenciaDoc = await transaction.get(asistenciaRef)
        if (asistenciaDoc.exists) throw new Error('Ya estás registrado para este evento')

        const evento = eventoDoc.data()!

        // Count current attendees
        const asistenciasSnapshot = await transaction.get(
            adminDb.collection('asistencias_eventos').where('evento_id', '==', eventoId)
        )
        const asistentesActuales = asistenciasSnapshot.size

        if (evento.max_asistentes && asistentesActuales >= evento.max_asistentes) {
            throw new Error('Lo sentimos, el aforo para este evento está completo')
        }

        transaction.set(asistenciaRef, {
            id: asistenciaRef.id,
            evento_id: eventoId,
            perfil_id: user.uid,
            created_at: new Date().toISOString()
        })
    })

    revalidatePath('/dashboard/eventos')
}

export async function unregisterFromEvent(eventoId: string) {
    const user = await getUser()
    if (!user) throw new Error('No estás autenticado')

    const asistenciaRef = adminDb.collection('asistencias_eventos').doc(`${eventoId}_${user.uid}`)
    await asistenciaRef.delete()

    revalidatePath('/dashboard/eventos')
}

export async function createEvent(formData: any) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (!profile || profile.rol !== 'admin') {
        throw new Error('No tienes permisos para crear eventos')
    }

    const newRef = adminDb.collection('eventos').doc()
    await newRef.set({
        id: newRef.id,
        ampa_id: profile.ampa_id,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        lugar: formData.lugar,
        tipo: formData.tipo,
        imagen_url: formData.imagen_url,
        max_asistentes: formData.max_asistentes ? parseInt(formData.max_asistentes) : null,
        created_at: new Date().toISOString()
    })

    await sendNotificationToAMPA(profile.ampa_id, {
        titulo: 'Nuevo evento programado',
        contenido: `Se ha publicado: ${formData.titulo}`,
        tipo: 'evento',
        enlace: '/dashboard/eventos'
    })

    revalidatePath('/dashboard/eventos')
}
