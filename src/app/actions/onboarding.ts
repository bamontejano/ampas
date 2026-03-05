'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendNotificationToAMPA } from './notifications'

export async function redeemInvitation(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const codigo = formData.get('codigo') as string
    if (!codigo) throw new Error('Código no proporcionado')

    // 1. Procesar todo en una sola transacción atómica via RPC
    const { data: res, error: rpcError } = await supabase.rpc('procesar_registro_con_invitacion', {
        p_codigo: codigo,
        p_user_id: user.id,
        p_nombre_completo: null // Ya tiene nombre en el perfil
    })

    if (rpcError || !res.success) {
        throw new Error(rpcError?.message || res.error || 'Error al validar el código')
    }

    // 2. Notificar al AMPA del nuevo ingreso
    const { data: userData } = await supabase.from('profiles').select('nombre_completo').eq('id', user.id).single()

    await sendNotificationToAMPA(res.ampa_id, {
        titulo: res.es_admin ? 'Nuevo Administrador asignado' : 'Nuevo miembro en la comunidad',
        contenido: `${userData?.nombre_completo || 'Un nuevo usuario'} se ha unido al AMPA.`,
        tipo: 'comunidad',
        enlace: '/dashboard/admin/usuarios'
    })

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
