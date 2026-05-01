'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotificationToUser } from './notifications'

// ─── User Management Actions ──────────────────────────────────────────────────

export async function updateMemberRole(memberId: string, newRole: 'user' | 'admin') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para cambiar roles')
    }

    // Cannot change role of yourself
    if (memberId === user.id) {
        throw new Error('No puedes cambiar tu propio rol')
    }

    // Make sure target member belongs to same AMPA
    const { data: target } = await supabase
        .from('profiles')
        .select('ampa_id')
        .eq('id', memberId)
        .single()

    if (target?.ampa_id !== profile?.ampa_id) {
        throw new Error('El usuario no pertenece a tu AMPA')
    }

    const { error } = await supabase
        .from('profiles')
        .update({ rol: newRole })
        .eq('id', memberId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/usuarios')
    return { success: true }
}

export async function updateMemberSubscription(memberId: string, status: 'activo' | 'pendiente', months: number = 12) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para gestionar suscripciones')
    }

    // Verify same AMPA
    const { data: target } = await supabase
        .from('profiles')
        .select('ampa_id')
        .eq('id', memberId)
        .single()

    if (target?.ampa_id !== profile?.ampa_id) {
        throw new Error('El usuario no pertenece a tu AMPA')
    }

    const until = status === 'activo'
        ? new Date(new Date().setMonth(new Date().getMonth() + months)).toISOString()
        : null

    const { error } = await supabase
        .from('profiles')
        .update({
            estado_suscripcion: status,
            suscripcion_hasta: until
        })
        .eq('id', memberId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/usuarios')
    return { success: true }
}

export async function removeMember(memberId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para eliminar miembros')
    }

    if (memberId === user.id) {
        throw new Error('No puedes eliminarte a ti mismo')
    }

    // Verify same AMPA
    const { data: target } = await supabase
        .from('profiles')
        .select('ampa_id')
        .eq('id', memberId)
        .single()

    if (target?.ampa_id !== profile?.ampa_id) {
        throw new Error('El usuario no pertenece a tu AMPA')
    }

    // Detach user from AMPA (soft remove — keeps account, removes from AMPA)
    const { error } = await supabase
        .from('profiles')
        .update({ ampa_id: null, rol: 'user' })
        .eq('id', memberId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/usuarios')
    return { success: true }
}

// ─── Invitation Actions ───────────────────────────────────────────────────────

export async function createInvitations(count: number = 1) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para realizar esta acción')
    }

    const ampaId = profile?.ampa_id
    if (!ampaId) throw new Error('No se encontró el ID del AMPA')

    const newInvitations = Array.from({ length: count }).map(() => ({
        ampa_id: ampaId,
        creado_por: user.id,
        codigo: Math.random().toString(36).substring(2, 8).toUpperCase(),
        usado: false
    }))

    const { error } = await supabase
        .from('invitaciones')
        .insert(newInvitations)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/invitaciones')
    return { success: true }
}

export async function deleteInvitation(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No autenticado')

    // Basic permission check
    const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos')
    }

    const { error } = await supabase
        .from('invitaciones')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/invitaciones')
    return { success: true }
}

// ─── App Management Actions ───────────────────────────────────────────────────

export async function createAmpaApp(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

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

    const { error } = await supabase
        .from('ampa_apps')
        .insert({
            ampa_id: ampaId,
            nombre,
            descripcion,
            url_acceso,
            icono,
            color
        })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/apps')
    revalidatePath('/dashboard/admin/apps')
    return { success: true }
}

export async function deleteAmpaApp(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos')
    }

    const { error } = await supabase
        .from('ampa_apps')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/apps')
    revalidatePath('/dashboard/admin/apps')
    return { success: true }
}

export async function updateAmpaSettings(ampaId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // Verify user is admin of THIS ampa
    const { data: profile } = await supabase
        .from('profiles')
        .select('rol, ampa_id')
        .eq('id', user.id)
        .single()

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

    const { error } = await supabase
        .from('ampas')
        .update(updates)
        .eq('id', ampaId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin/perfil-ampa')
    return { success: true }
}

export async function enviarComunicado(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('rol, ampa_id')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        throw new Error('No tienes permisos para enviar comunicados')
    }

    const ampaId = profile?.ampa_id
    if (!ampaId) throw new Error('No tienes un AMPA vinculado')

    const titulo = formData.get('titulo') as string
    const contenido = formData.get('contenido') as string
    const tipo = formData.get('tipo') as string || 'sistema'
    const enlace = formData.get('enlace') as string || null

    const { error } = await supabase.rpc('enviar_comunicado_masivo', {
        p_ampa_id: ampaId,
        p_autor_id: user.id,
        p_titulo: titulo,
        p_contenido: contenido,
        p_tipo: tipo,
        p_enlace: enlace
    })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
}
