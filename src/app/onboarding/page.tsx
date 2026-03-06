import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from '@/components/onboarding/onboarding-client'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // La pantalla de onboarding ha sido eliminada a petición del usuario.
    // Redirigimos siempre al dashboard.
    redirect('/dashboard')
}
