'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Guard helper — throws if caller is not superadmin
async function requireSuperadmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'superadmin') {
        throw new Error('Acceso denegado: se requiere rol superadmin')
    }

    return { supabase, user, profile }
}

// ─── Create a new AMPA ────────────────────────────────────────────────────────

export async function createAmpa(formData: FormData): Promise<void> {
    const { supabase } = await requireSuperadmin()

    const nombre = formData.get('nombre') as string
    const colegioNombre = formData.get('colegio_nombre') as string
    const ciudad = formData.get('ciudad') as string
    const plan = (formData.get('plan') as string) || 'basico'

    if (!nombre?.trim()) throw new Error('El nombre del AMPA es obligatorio')

    // Generate a URL-safe slug from name
    const slug = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    const { error } = await supabase.from('ampas').insert({
        nombre: nombre.trim(),
        slug,
        colegio_nombre: colegioNombre?.trim() || null,
        ciudad: ciudad?.trim() || null,
        plan: plan as 'basico' | 'estandar' | 'premium',
        activo: true,
    })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/superadmin/ampas')
}

// ─── Toggle AMPA active/inactive ─────────────────────────────────────────────

export async function toggleAmpaStatus(ampaId: string, currentStatus: boolean) {
    const { supabase } = await requireSuperadmin()

    const { error } = await supabase
        .from('ampas')
        .update({ activo: !currentStatus })
        .eq('id', ampaId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/superadmin/ampas')
    return { success: true }
}

// ─── Delete an AMPA (hard delete — use with caution) ─────────────────────────

export async function deleteAmpa(ampaId: string) {
    const { supabase } = await requireSuperadmin()

    const { error } = await supabase
        .from('ampas')
        .delete()
        .eq('id', ampaId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/superadmin/ampas')
    return { success: true }
}

// ─── Generate an Admin Code for an AMPA ────────────────────────────────────────

export async function generateAdminCode(ampaId: string) {
    const { supabase, user } = await requireSuperadmin()

    // Prefix the code with ADMIN- so we can recognize it during onboarding
    const adminCode = `ADMIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { error } = await supabase
        .from('invitaciones')
        .insert({
            ampa_id: ampaId,
            creado_por: user.id,
            codigo: adminCode,
            usado: false
        })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/superadmin/ampas')
    return { success: true, codigo: adminCode }
}
