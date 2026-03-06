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

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')

    if (authData?.user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', authData.user.id)
            .maybeSingle()

        let userRol = profile?.rol

        // Failsafe: Si el RPC estaba desactualizado y el rol se quedó en familia,
        // comprobamos si usaron un código ADMIN- y les damos el rol correcto.
        if (userRol === 'familia') {
            const { data: invite } = await supabase
                .from('invitaciones')
                .select('codigo')
                .eq('usado_por', authData.user.id)
                .like('codigo', 'ADMIN-%')
                .limit(1)
                .maybeSingle()

            if (invite) {
                await supabase.from('profiles').update({ rol: 'admin_ampa' }).eq('id', authData.user.id)
                userRol = 'admin_ampa'
            }
        }

        if (userRol === 'admin_ampa' || userRol === 'junta') {
            redirect('/dashboard/admin')
        }

        if (userRol === 'superadmin') {
            redirect('/dashboard/superadmin/ampas')
        }
    }

    redirect('/dashboard')
}

export async function register(formData: FormData) {
    const supabase: any = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nombre = formData.get('nombre') as string
    const codigoInvitacion = formData.get('codigo_invitacion') as string | null

    // El código de invitación ahora es opcional. 
    // Si no se proporciona, el usuario pasará por la pantalla de Onboarding después de registrarse.

    // 1. Validar el código de invitación ANTES de registrar al usuario
    let invitacion = null
    if (codigoInvitacion) {
        const { data, error: invError } = await supabase
            .rpc('get_invitacion_by_codigo', { p_codigo: codigoInvitacion.trim().toUpperCase() })

        if (invError) {
            console.error('RPC Error:', invError)
            return { error: 'Error al verificar el código. Inténtalo de nuevo.' }
        }

        if (!data) {
            return { error: 'El código de invitación no es válido o no existe.' }
        }

        invitacion = data
        if (invitacion.usado) {
            return { error: 'Este código de invitación ya ha sido utilizado.' }
        }
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

    // 3. Vincular el perfil si hubo invitación consumiendo la nueva RPC atómica
    if (codigoInvitacion) {
        const { data: res, error: rpcError } = await supabase.rpc('procesar_registro_con_invitacion', {
            p_codigo: codigoInvitacion,
            p_user_id: authData.user.id,
            p_nombre_completo: nombre
        })

        if (rpcError || !res.success) {
            console.error('Error procesando invitación en registro:', rpcError || res.error)
            // No bloqueamos el registro, pero el usuario tendrá que completar el onboarding
        }
    }

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
