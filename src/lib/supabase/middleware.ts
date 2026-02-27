import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresca la sesión automáticamente
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Rutas protegidas - redirige a login si no está autenticado
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/ampa')

    if (!user && isProtectedRoute) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Si ya está autenticado y va a auth, redirige al dashboard
    if (user && isAuthRoute) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
}
