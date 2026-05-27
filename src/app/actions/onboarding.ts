'use server'

import { adminDb, getUser } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendNotificationToAMPA } from './notifications'

export async function redeemInvitation(formData: FormData) {
    const user = await getUser()
    if (!user) redirect('/auth/login')

    const codigo = formData.get('codigo') as string
    if (!codigo) throw new Error('Código no proporcionado')

    // Find invitation
    const invitacionesRef = adminDb.collection('invitaciones')
    const q = invitacionesRef.where('codigo', '==', codigo.trim().toUpperCase())
    const snapshot = await q.get()

    if (snapshot.empty) {
        throw new Error('El código de invitación no es válido o no existe')
    }

    const invDoc = snapshot.docs[0]
    const invData = invDoc.data()

    if (invData.usado) {
        throw new Error('Este código ya ha sido utilizado')
    }

    const esAdmin = invData.codigo.startsWith('ADMIN-')
    const rolAsignado = esAdmin ? 'admin' : 'user'

    // Update in transaction
    await adminDb.runTransaction(async (transaction) => {
        const invRef = invDoc.ref
        const userRef = adminDb.collection('profiles').doc(user.uid)
        
        transaction.update(invRef, { usado: true })
        transaction.set(userRef, {
            ampa_id: invData.ampa_id,
            rol: rolAsignado,
            onboarding_completado: true
        }, { merge: true })
    })

    // Notify AMPA
    try {
        const userDoc = await adminDb.collection('profiles').doc(user.uid).get()
        const userData = userDoc.data()

        await sendNotificationToAMPA(invData.ampa_id, {
            titulo: esAdmin ? 'Nuevo Administrador asignado' : 'Nuevo miembro en la comunidad',
            contenido: `${userData?.nombre_completo || 'Un nuevo usuario'} se ha unido al AMPA.`,
            tipo: 'sistema',
            enlace: esAdmin ? '/dashboard/admin/usuarios' : undefined
        })
    } catch (error) {
        console.error('Error enviando notificación de bienvenida:', error)
    }

    revalidatePath('/', 'layout')

    if (esAdmin) {
        redirect('/dashboard/admin')
    }

    redirect('/dashboard')
}

export async function skipOnboarding() {
    const user = await getUser()
    if (!user) redirect('/auth/login')

    await adminDb.collection('profiles').doc(user.uid).set({
        onboarding_completado: true
    }, { merge: true })

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
