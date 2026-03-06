import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from '@/components/onboarding/onboarding-client'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // Optional: check if already completed and redirect
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completado')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.onboarding_completado) {
        redirect('/dashboard')
    }

    return <OnboardingClient />
}
