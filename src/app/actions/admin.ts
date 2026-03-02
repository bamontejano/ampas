'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

// ─── User Management Actions ──────────────────────────────────────────────────

export async function updateMemberRole(memberId: string, newRole: 'familia' | 'junta' | 'admin_ampa') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (!['admin_ampa', 'superadmin'].includes(profile?.rol || '')) {
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

export async function removeMember(memberId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (!['admin_ampa', 'superadmin'].includes(profile?.rol || '')) {
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
        .update({ ampa_id: null, rol: 'familia' })
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

    if (!['admin_ampa', 'superadmin', 'junta'].includes(profile?.rol || '')) {
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

    if (!['admin_ampa', 'superadmin', 'junta'].includes(profile?.rol || '')) {
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
