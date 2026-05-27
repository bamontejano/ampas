'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/client'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const token = await userCredential.user.getIdToken()
            
            // Set session cookie
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            if (err.code === 'auth/invalid-credential') {
                setError('Email o contraseña incorrectos.')
            } else {
                setError(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300">
            {error && (
                    <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700 border border-rose-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
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
                                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-slate-400"
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
                                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: 'var(--ampa-color, #4f46e5)' }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Iniciar sesión'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-slate-500">
                        ¿No tienes cuenta?{' '}
                        <Link href="/auth/register" style={{ color: 'var(--ampa-color, #4f46e5)' }} className="font-bold hover:opacity-80 transition-colors">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
        </div>
    )
}
