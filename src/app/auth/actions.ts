'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase: any = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function register(formData: FormData) {
    const supabase: any = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nombre = formData.get('nombre') as string
    const codigoInvitacion = formData.get('codigo_invitacion') as string | null

    if (!codigoInvitacion) {
        return { error: 'El código de invitación es obligatorio' }
    }

    // 1. Validar el código de invitación ANTES de registrar al usuario
    const { data: invitacion, error: invError } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('codigo', codigoInvitacion.toUpperCase())
        .eq('usado', false)
        .single()

    if (invError || !invitacion) {
        return { error: 'Código de invitación inválido o ya utilizado. Contacta con tu AMPA.' }
    }

    // 2. Si el código es válido, procedemos con el registro en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre_completo: nombre,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' }
    }

    // 3. Vincular el perfil recién creado con el AMPA de la invitación
    // El trigger en la DB suele crear el profile automáticamente, aquí lo actualizamos
    const { error: linkError } = await supabase
        .from('profiles')
        .update({ ampa_id: invitacion.ampa_id })
        .eq('id', authData.user.id)

    if (linkError) {
        console.error('Error al vincular con el AMPA:', linkError)
        // Nota: El usuario ya está creado, pero no vinculado. 
        // Esto podría requerir intervención manual o un reintento posterior.
    }

    // 4. Marcar la invitación como utilizada
    await supabase
        .from('invitaciones')
        .update({ usado: true, usado_por: authData.user.id })
        .eq('id', invitacion.id)

    return { success: true, message: '¡Cuenta creada! Revisa tu email para confirmar tu cuenta y empezar.' }
}

export async function logout() {
    const supabase: any = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/auth/login')
}

export async function loginWithGoogle() {
    const supabase: any = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function resetPassword(formData: FormData) {
    const supabase: any = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Revisa tu email para resetear tu contraseña' }
}
