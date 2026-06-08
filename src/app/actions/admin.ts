'use server'

import { adminDb, getUser } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import { sendNotificationToUser } from './notifications'

// ─── User Management Actions ──────────────────────────────────────────────────

export async function updateMemberRole(memberId: string, newRole: 'user' | 'admin') {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para cambiar roles')
    }

    if (memberId === user.uid) {
        throw new Error('No puedes cambiar tu propio rol')
    }

    const targetDoc = await adminDb.collection('profiles').doc(memberId).get()
    const target = targetDoc.data()

    if (target?.ampa_id !== profile?.ampa_id) {
        throw new Error('El usuario no pertenece a tu AMPA')
    }

    await targetDoc.ref.update({ rol: newRole })

    revalidatePath('/dashboard/admin/usuarios')
    return { success: true }
}

export async function updateMemberSubscription(memberId: string, status: 'activo' | 'pendiente', months: number = 12) {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para gestionar suscripciones')
    }

    const targetDoc = await adminDb.collection('profiles').doc(memberId).get()
    const target = targetDoc.data()

    if (target?.ampa_id !== profile?.ampa_id) {
        throw new Error('El usuario no pertenece a tu AMPA')
    }

    const until = status === 'activo'
        ? new Date(new Date().setMonth(new Date().getMonth() + months)).toISOString()
        : null

    await targetDoc.ref.update({
        estado_suscripcion: status,
        suscripcion_hasta: until
    })

    revalidatePath('/dashboard/admin/usuarios')
    return { success: true }
}

export async function removeMember(memberId: string) {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para eliminar miembros')
    }

    if (memberId === user.uid) {
        throw new Error('No puedes eliminarte a ti mismo')
    }

    const targetDoc = await adminDb.collection('profiles').doc(memberId).get()
    const target = targetDoc.data()

    if (target?.ampa_id !== profile?.ampa_id) {
        throw new Error('El usuario no pertenece a tu AMPA')
    }

    await targetDoc.ref.update({ ampa_id: null, rol: 'user' })

    revalidatePath('/dashboard/admin/usuarios')
    return { success: true }
}

// ─── Invitation Actions ───────────────────────────────────────────────────────

export async function createInvitations(count: number = 1, role: 'user' | 'admin' = 'user') {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para realizar esta acción')
    }

    const ampaId = profile?.ampa_id
    if (!ampaId) throw new Error('No se encontró el ID del AMPA')

    const batch = adminDb.batch()
    const invitacionesRef = adminDb.collection('invitaciones')

    for (let i = 0; i < count; i++) {
        const baseCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const newRef = invitacionesRef.doc()
        batch.set(newRef, {
            id: newRef.id,
            ampa_id: ampaId,
            creado_por: user.uid,
            codigo: role === 'admin' ? `ADMIN-${baseCode}` : baseCode,
            usado: false,
            created_at: new Date().toISOString()
        })
    }

    await batch.commit()

    revalidatePath('/dashboard/admin/invitaciones')
    revalidatePath('/dashboard/admin/usuarios')
    return { success: true }
}

export async function deleteInvitation(id: string) {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos')
    }

    await adminDb.collection('invitaciones').doc(id).delete()

    revalidatePath('/dashboard/admin/invitaciones')
    return { success: true }
}

// ─── App Management Actions ───────────────────────────────────────────────────

export async function createAmpaApp(formData: FormData) {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos')
    }

    const ampaId = profile?.ampa_id
    if (!ampaId) throw new Error('No se encontró el ID del AMPA')

    const nombre = formData.get('nombre') as string
    const descripcion = formData.get('descripcion') as string
    const url_acceso = formData.get('url_acceso') as string
    const icono = formData.get('icono') as string || 'Zap'
    const color = formData.get('color') as string || 'indigo'

    const newRef = adminDb.collection('ampa_apps').doc()
    await newRef.set({
        id: newRef.id,
        ampa_id: ampaId,
        nombre,
        descripcion,
        url_acceso,
        icono,
        color,
        created_at: new Date().toISOString()
    })

    revalidatePath('/dashboard/apps')
    revalidatePath('/dashboard/admin/apps')
    return { success: true }
}

export async function deleteAmpaApp(id: string) {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos')
    }

    await adminDb.collection('ampa_apps').doc(id).delete()

    revalidatePath('/dashboard/apps')
    revalidatePath('/dashboard/admin/apps')
    return { success: true }
}

export async function updateAmpaSettings(ampaId: string, formData: FormData) {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin' || profile?.ampa_id !== ampaId) {
        throw new Error('No tienes permisos para editar este AMPA')
    }

    const updates = {
        nombre: formData.get('nombre') as string,
        descripcion: formData.get('descripcion') as string,
        color_primario: formData.get('color_primario') as string,
        colegio_nombre: formData.get('colegio_nombre') as string,
        ciudad: formData.get('ciudad') as string,
        logo_url: formData.get('logo_url') as string,
    }

    await adminDb.collection('ampas').doc(ampaId).update(updates)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin/perfil-ampa')
    return { success: true }
}

export async function enviarComunicado(formData: FormData) {
    const user = await getUser()
    if (!user) throw new Error('No autenticado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para enviar comunicados')
    }

    const ampaId = profile?.ampa_id
    if (!ampaId) throw new Error('No tienes un AMPA vinculado')

    const titulo = formData.get('titulo') as string
    const contenido = formData.get('contenido') as string
    const tipo = formData.get('tipo') as string || 'sistema'
    const enlace = formData.get('enlace') as string || null

    // Fetch all users of this AMPA to notify them
    const snapshot = await adminDb.collection('profiles').where('ampa_id', '==', ampaId).get()
    
    const batch = adminDb.batch()
    snapshot.docs.forEach(doc => {
        const notifRef = adminDb.collection('notificaciones').doc()
        batch.set(notifRef, {
            id: notifRef.id,
            user_id: doc.id,
            ampa_id: ampaId,
            titulo,
            contenido,
            tipo,
            enlace,
            leida: false,
            created_at: new Date().toISOString()
        })
    })

    await batch.commit()

    revalidatePath('/dashboard')
    return { success: true }
}
