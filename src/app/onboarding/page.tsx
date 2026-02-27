import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function completeOnboarding() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { error } = await supabase
        .from('profiles')
        .update({
            onboarding_completado: true
        })
        .eq('id', user.id)

    if (!error) {
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }
}

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl text-center">
                <div className="mb-8">
                    <div className="mx-auto mb-6 h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">¡Registro Completado!</h1>
                    <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                        Bienvenido a <strong>AMPA Connect</strong>. Tu cuenta ha sido activada correctamente
                        y ya tienes acceso a todos los recursos y foros de tu comunidad escolar.
                    </p>
                </div>

                <form action={completeOnboarding}>
                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-indigo-600 py-4 font-black text-white transition-all hover:bg-indigo-500 shadow-xl shadow-indigo-200 uppercase tracking-widest text-sm active:scale-95"
                    >
                        Entrar al Dashboard
                    </button>
                </form>
            </div>
        </div>
    )
}
