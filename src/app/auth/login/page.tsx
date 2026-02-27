'use client'

import Link from 'next/link'
import { useState } from 'react'
import { login } from '../actions'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleLogin(formData: FormData) {
        setLoading(true)
        setError(null)

        // Llamamos a la Server Action
        const result = await login(formData)

        // Si devuelve algo, es que hubo error (si tiene éxito redirige y no llega aquí)
        if (result?.error) {
            if (result.error.includes('Invalid login credentials')) {
                setError('Email o contraseña incorrectos.')
            } else if (result.error.includes('Email not confirmed')) {
                setError('Debes confirmar tu email antes de entrar.')
            } else {
                setError(result.error)
            }
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <span className="text-xl font-bold">A</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Bienvenido de nuevo</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Accede al espacio privado de tu AMPA
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700 border border-rose-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <form action={handleLogin} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Iniciar sesión'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-slate-500">
                        ¿No tienes cuenta?{' '}
                        <Link href="/auth/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
