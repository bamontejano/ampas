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
            // Comprobar el rol del usuario para redirigir apropiadamente si no se especificó un destino (next)
            if (next === '/dashboard') {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('rol')
                    .eq('id', user.id)
                    .maybeSingle()

                let userRol = profile?.rol

                // Failsafe: if RPC failed to assign admin_ampa role
                if (userRol === 'familia') {
                    const { data: invite } = await supabase
                        .from('invitaciones')
                        .select('codigo')
                        .eq('usado_por', user.id)
                        .like('codigo', 'ADMIN-%')
                        .limit(1)
                        .maybeSingle()

                    if (invite) {
                        await supabase.from('profiles').update({ rol: 'admin_ampa' }).eq('id', user.id)
                        userRol = 'admin_ampa'
                    }
                }

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
