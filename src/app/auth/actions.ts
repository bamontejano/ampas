'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

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
            .select('rol, onboarding_completado, ampa_id')
            .eq('id', authData.user.id)
            .maybeSingle()

        let userRol = profile?.rol
        const onboardingCompletado = profile?.onboarding_completado
        const codigoInvitacion = authData.user.user_metadata?.codigo_invitacion

        // Failsafe: Procesar código de invitación SOLO si el usuario no tiene AMPA vinculada
        // Esto evita que códigos antiguos en metadata sobreescriban roles actuales.
        if (codigoInvitacion && !profile?.ampa_id) {
            const { data: rpcResult, error: rpcError } = await supabase.rpc(
                'procesar_registro_con_invitacion',
                {
                    p_codigo: codigoInvitacion,
                    p_user_id: authData.user.id,
                    p_nombre_completo: authData.user.user_metadata?.nombre_completo || null,
                    p_email: authData.user.email || null,
                }
            )

            if (rpcError) {
                console.error('Error rescatando invitación en login:', rpcError)
            } else if (rpcResult?.success) {
                userRol = rpcResult.rol_asignado || (rpcResult.es_admin ? 'admin' : 'user')
            }
        }

        if (userRol === 'admin') {
            redirect('/dashboard/admin')
        }
    }

    redirect('/dashboard')
}

export async function register(formData: FormData) {
    const supabase = await createClient()

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
    // IMPORTANTE: El perfil se crea en la BD mediante un trigger al confirmar el email,
    // por eso NO podemos llamar al RPC aquí. Guardamos el código en user_metadata
    // para procesarlo en el callback tras la confirmación.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre_completo: nombre,
                // Guardamos el código para procesarlo en el callback post-confirmación
                codigo_invitacion: codigoInvitacion?.trim().toUpperCase() || null,
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

    // Procesamiento INMEDIATO del código (Esperamos 2.5s para asegurar que el trigger DB haya creado el perfil)
    // Usamos el RPC porque es SECURITY DEFINER; las llamadas directas .update() fallarían por RLS
    if (codigoInvitacion) {
        await new Promise(resolve => setTimeout(resolve, 2500))
        
        const { error: rpcError } = await supabase.rpc(
            'procesar_registro_con_invitacion',
            {
                p_codigo: codigoInvitacion.trim().toUpperCase(),
                p_user_id: authData.user.id,
                p_nombre_completo: nombre,
                p_email: email,
            }
        )

        if (rpcError) {
            console.error('Error procesando código inmediatamente tras registro:', rpcError)
        }
    }

    return { success: true, message: '¡Cuenta creada! Revisa tu email para confirmar tu cuenta y empezar.' }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/auth/login')
}

export async function loginWithGoogle() {
    const supabase = await createClient()

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
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Revisa tu email para resetear tu contraseña' }
}
