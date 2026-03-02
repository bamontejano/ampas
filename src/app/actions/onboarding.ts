'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function redeemInvitation(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const codigo = formData.get('codigo') as string
    if (!codigo) throw new Error('Código no proporcionado')

    // 1. Find the invitation
    const { data: invitation, error: fetchError } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('codigo', codigo.trim().toUpperCase())
        .single()

    if (fetchError || !invitation) {
        throw new Error('Código de invitación no válido o inexistente')
    }

    // 2. Check if already used
    if (invitation.usado) {
        throw new Error('Este código ya ha sido utilizado')
    }

    // 3. (Optional) Check expiration
    if (invitation.expira_at && new Date(invitation.expira_at) < new Date()) {
        throw new Error('Este código ha expirado')
    }

    // 4. Atomic transaction (best effort with Supabase)
    // First, mark invitation as used
    const { error: useError } = await supabase
        .from('invitaciones')
        .update({
            usado: true,
            usado_por: user.id
        })
        .eq('id', invitation.id)

    if (useError) throw new Error('Error al procesar la invitación')

    // Second, update user profile
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            ampa_id: invitation.ampa_id,
            onboarding_completado: true
        })
        .eq('id', user.id)

    if (profileError) {
        // Rollback invitation usage (minimal effort)
        await supabase
            .from('invitaciones')
            .update({ usado: false, usado_por: null })
            .eq('id', invitation.id)

        throw new Error('Error al actualizar el perfil')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function skipOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { error } = await supabase
        .from('profiles')
        .update({
            onboarding_completado: true
        })
        .eq('id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
