'use client'

import Link from 'next/link'
import { useState } from 'react'
import { register } from '../actions'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleRegister(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(null)

        const result = await register(formData)

        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            setSuccess(result.message)
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
                <div className="text-center">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Únete a tu AMPA</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Crea tu cuenta para conectar con tu centro escolar
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700 border border-rose-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="flex flex-col items-center gap-3 rounded-2xl bg-emerald-50 p-6 text-emerald-800 border border-emerald-100 animate-in zoom-in-95 fill-mode-both">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
                        <p className="text-center text-sm font-bold">{success}</p>
                        <Link
                            href="/auth/login"
                            className="mt-4 text-sm font-black text-emerald-700 underline decoration-2 underline-offset-4 hover:text-emerald-800"
                        >
                            Ir a iniciar sesión
                        </Link>
                    </div>
                )}

                {!success && (
                    <form action={handleRegister} className="mt-8 space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                    Nombre completo
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="Ej: Ana García"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div>
                                <label htmlFor="codigo_invitacion" className="block text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                                    Código de Invitación (Opcional)
                                </label>
                                <input
                                    id="codigo_invitacion"
                                    name="codigo_invitacion"
                                    type="text"
                                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase font-mono tracking-widest"
                                    placeholder="ABCDEF"
                                />
                                <p className="mt-1 text-[10px] text-slate-400 font-medium px-1">
                                    Si no tienes código, podrás entrar como invitado y añadirlo más tarde.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear cuenta'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center text-sm">
                    <p className="text-slate-500 font-medium">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/auth/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
