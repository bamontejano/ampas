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

                if (profile?.rol === 'admin_ampa' || profile?.rol === 'junta') {
                    return NextResponse.redirect(`${origin}/dashboard/admin`)
                }

                if (profile?.rol === 'superadmin') {
                    return NextResponse.redirect(`${origin}/dashboard/superadmin/ampas`)
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Error - redirige a la página de error de auth
    return NextResponse.redirect(`${origin}/auth/error`)
}
