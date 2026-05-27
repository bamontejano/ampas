import { getUser } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
    const user = await getUser()

    if (!user) redirect('/auth/login')

    // La pantalla de onboarding ha sido eliminada a petición del usuario.
    // Redirigimos siempre al dashboard.
    redirect('/dashboard')
}
