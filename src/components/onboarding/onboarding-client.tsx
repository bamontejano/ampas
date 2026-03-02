'use client'

import { useState, useTransition } from 'react'
import { redeemInvitation, skipOnboarding } from '@/app/actions/onboarding'
import {
    Ticket,
    ChevronRight,
    Users,
    Sparkles,
    ArrowRight,
    Loader2,
    ShieldAlert
} from 'lucide-react'

export default function OnboardingClient() {
    const [view, setView] = useState<'welcome' | 'code'>('welcome')
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleRedeem = (formData: FormData) => {
        setError(null)
        startTransition(async () => {
            try {
                await redeemInvitation(formData)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    const handleSkip = () => {
        setError(null)
        startTransition(async () => {
            try {
                await skipOnboarding()
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

            <main className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-700 ease-out"
                        style={{ width: view === 'welcome' ? '50%' : '100%' }}
                    ></div>
                </div>

                <div className="p-8 md:p-12 lg:p-16">
                    {view === 'welcome' ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Header */}
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Te damos la bienvenida
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                    Conecta con tu <span className="text-indigo-600">Comunidad</span>
                                </h1>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                                    Estás a un paso de acceder a todos los recursos, eventos y foros psicoeducativos de tu centro escolar.
                                </p>
                            </div>

                            {/* Options */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <button
                                    onClick={() => setView('code')}
                                    className="group relative flex flex-col items-start p-6 text-left rounded-3xl bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Ticket className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg">Tengo un código</h3>
                                    <p className="text-slate-400 text-xs font-semibold mt-1">Únete a tu AMPA usando el código que te han facilitado.</p>
                                    <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-indigo-400 opacity-50 group-hover:opacity-100 transition-all" />
                                </button>

                                <button
                                    onClick={handleSkip}
                                    disabled={isPending}
                                    className="group relative flex flex-col items-start p-6 text-left rounded-3xl bg-white hover:bg-slate-50 border-2 border-slate-100 transition-all active:scale-[0.98]"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        {isPending ? <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" /> : <Users className="w-6 h-6 text-indigo-600" />}
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-lg">Solo explorar</h3>
                                    <p className="text-slate-500 text-xs font-semibold mt-1">Entra sin asociarte a un centro por ahora.</p>
                                    <ChevronRight className="absolute bottom-6 right-6 w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full border border-slate-100 flex items-center justify-center text-slate-400">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-normal">
                                    Para crear una nueva AMPA, contacta con tu administrador de zona o espera la invitación global.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Header */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => setView('welcome')}
                                    className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-2"
                                >
                                    <ArrowRight className="w-3 h-3 rotate-180" />
                                    Volver atrás
                                </button>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Introduce tu código</h2>
                                <p className="text-md text-slate-500 font-medium">
                                    Escribe el código de 6 caracteres que has recibido por email o de parte de tu AMPA.
                                </p>
                            </div>

                            {/* Form */}
                            <form action={handleRedeem} className="space-y-6">
                                <div className="relative group">
                                    <input
                                        name="codigo"
                                        autoFocus
                                        required
                                        maxLength={6}
                                        placeholder="EJ: XJ72P9"
                                        className="w-full h-20 text-center text-3xl font-black tracking-[0.4em] uppercase rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-200"
                                    />
                                    <div className="absolute inset-0 rounded-3xl bg-indigo-600/5 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-all"></div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-3 animate-in shake duration-500">
                                        <ShieldAlert className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Validando...
                                        </>
                                    ) : (
                                        <>
                                            Unirme ahora
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
