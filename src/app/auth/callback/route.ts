import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            /* 
            // Eliminamos la comprobación de onboarding para evitar bucles
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('onboarding_completado, ampa_id')
                    .eq('id', user.id)
                    .maybeSingle()

                if (!profile || !profile.onboarding_completado || !profile.ampa_id) {
                    return NextResponse.redirect(`${origin}/onboarding`)
                }
            }
            */
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Error - redirige a la página de error de auth
    return NextResponse.redirect(`${origin}/auth/error`)
}
