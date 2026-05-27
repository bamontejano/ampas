'use server'

import { adminDb, getUser } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import * as admin from 'firebase-admin'
import { sendNotificationToAMPA } from './notifications'

export async function createPoll(data: {
    pregunta: string
    descripcion?: string
    opciones: string[]
    termina_at?: string
    anonima?: boolean
}) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (!profile || profile.rol !== 'admin') {
        throw new Error('No tienes permisos para crear votaciones')
    }

    const batch = adminDb.batch()
    const encuestaRef = adminDb.collection('encuestas').doc()

    batch.set(encuestaRef, {
        id: encuestaRef.id,
        ampa_id: profile.ampa_id,
        creador_id: user.uid,
        pregunta: data.pregunta,
        descripcion: data.descripcion || null,
        termina_at: data.termina_at || null,
        anonima: data.anonima || false,
        activa: true,
        created_at: new Date().toISOString()
    })

    data.opciones.forEach(texto => {
        const opcionRef = adminDb.collection('encuesta_opciones').doc()
        batch.set(opcionRef, {
            id: opcionRef.id,
            encuesta_id: encuestaRef.id,
            texto,
            votos_count: 0
        })
    })

    await batch.commit()

    await sendNotificationToAMPA(profile.ampa_id, {
        titulo: 'Nueva votación abierta',
        contenido: `Participa en: ${data.pregunta}`,
        tipo: 'votacion',
        enlace: '/dashboard/votaciones'
    })

    revalidatePath('/dashboard/votaciones')
}

export async function castVote(encuestaId: string, opcionId: string) {
    const user = await getUser()
    if (!user) throw new Error('Debes iniciar sesión para votar')

    const votoId = `${encuestaId}_${user.uid}`
    const votoRef = adminDb.collection('encuesta_votos').doc(votoId)
    const encuestaRef = adminDb.collection('encuestas').doc(encuestaId)
    const opcionRef = adminDb.collection('encuesta_opciones').doc(opcionId)

    await adminDb.runTransaction(async (t) => {
        const votoDoc = await t.get(votoRef)
        if (votoDoc.exists) throw new Error('Ya has participado en esta votación')

        const encuestaDoc = await t.get(encuestaRef)
        if (!encuestaDoc.exists) throw new Error('No se pudo encontrar la votación')

        const encuesta = encuestaDoc.data()!
        if (!encuesta.activa) {
            throw new Error('Esta votación ha sido cerrada por la junta directiva')
        }

        if (encuesta.termina_at && new Date(encuesta.termina_at) < new Date()) {
            throw new Error('El plazo de votación para esta encuesta ha finalizado')
        }

        t.set(votoRef, {
            id: votoId,
            encuesta_id: encuestaId,
            opcion_id: opcionId,
            perfil_id: user.uid,
            created_at: new Date().toISOString()
        })

        t.update(opcionRef, {
            votos_count: admin.firestore.FieldValue.increment(1)
        })
    })

    revalidatePath('/dashboard/votaciones')
}
