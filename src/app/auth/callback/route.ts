import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {

            // ──────────────────────────────────────────────────────────────
            // PASO 1: Procesar código de invitación guardado en user_metadata
            // El perfil ya existe en BD porque el trigger se ejecutó al
            // confirmar el email, así que ahora sí podemos llamar al RPC.
            // ──────────────────────────────────────────────────────────────
            const codigoInvitacion = user.user_metadata?.codigo_invitacion as string | null

            if (codigoInvitacion) {
                const { data: rpcResult, error: rpcError } = await supabase.rpc(
                    'procesar_registro_con_invitacion',
                    {
                        p_codigo: codigoInvitacion,
                        p_user_id: user.id,
                        p_nombre_completo: user.user_metadata?.nombre_completo || null,
                    }
                )

                if (!rpcError && rpcResult?.success) {
                    // Código procesado correctamente
                    const destino = rpcResult.es_admin
                        ? `${origin}/dashboard/admin`
                        : `${origin}/dashboard`
                    return NextResponse.redirect(destino)
                } else {
                    console.error('Error procesando inv en callback:', rpcError || rpcResult?.error)
                }
            }

            // ──────────────────────────────────────────────────────────────
            // PASO 2: No hay código, redirigir según rol existente
            // ──────────────────────────────────────────────────────────────
            if (next === '/dashboard') {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('rol')
                    .eq('id', user.id)
                    .maybeSingle()

                const userRol = profile?.rol

                if (userRol === 'admin_ampa' || userRol === 'junta') {
                    return NextResponse.redirect(`${origin}/dashboard/admin`)
                }

                if (userRol === 'superadmin') {
                    return NextResponse.redirect(`${origin}/dashboard/superadmin/ampas`)
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Error - redirige a la página de error de auth
    return NextResponse.redirect(`${origin}/auth/error`)
}
