import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from '@/components/onboarding/onboarding-client'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // Si ya tiene el onboarding hecho O ya tiene un ampa_id (del registro), ir al dashboard
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completado, ampa_id')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.onboarding_completado || profile?.ampa_id) {
        redirect('/dashboard')
    }

    return <OnboardingClient />
}
