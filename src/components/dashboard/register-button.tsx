'use client'

import { useState, useTransition } from 'react'
import { ChevronRight, Check, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { registerForEvent, unregisterFromEvent } from '@/app/actions/events'

interface RegisterButtonProps {
    eventoId: string
    isRegisteredInitial?: boolean
}

export default function RegisterButton({ eventoId, isRegisteredInitial = false }: RegisterButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [isRegistered, setIsRegistered] = useState(isRegisteredInitial)
    const [error, setError] = useState<string | null>(null)
    const [showConfirmCancel, setShowConfirmCancel] = useState(false)

    async function handleRegister() {
        if (isRegistered || isPending) return

        setError(null)
        startTransition(async () => {
            try {
                await registerForEvent(eventoId)
                setIsRegistered(true)
            } catch (err: any) {
                setError(err.message || 'Error al registrarse')
                setTimeout(() => setError(null), 3000)
            }
        })
    }

    async function handleUnregister() {
        if (!isRegistered || isPending) return

        setError(null)
        startTransition(async () => {
            try {
                await unregisterFromEvent(eventoId)
                setIsRegistered(false)
                setShowConfirmCancel(false)
            } catch (err: any) {
                setError(err.message || 'Error al cancelar registro')
                setTimeout(() => setError(null), 3000)
            }
        })
    }

    if (isRegistered) {
        if (showConfirmCancel) {
            return (
                <div className="mt-8 flex flex-col gap-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">¿Confirmas la cancelación?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConfirmCancel(false)}
                            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200"
                        >
                            No, volver
                        </button>
                        <button
                            onClick={handleUnregister}
                            disabled={isPending}
                            className="flex-1 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600 border border-rose-100 transition-all hover:bg-rose-100 flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                            Sí, cancelar
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className="mt-8 space-y-3">
                <div className="w-full rounded-2xl bg-emerald-50 px-6 py-4 text-sm font-bold text-emerald-600 border border-emerald-100 flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" /> Ya estoy registrado
                </div>
                <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                >
                    Cancelar asistencia
                </button>
            </div>
        )
    }

    return (
        <div className="mt-8 w-full relative">
            {error && (
                <div className="absolute -top-12 left-0 right-0 animate-bounce z-10">
                    <div className="bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-100 flex items-center justify-center gap-1.5 shadow-sm">
                        <AlertCircle className="h-3 w-3" /> {error}
                    </div>
                </div>
            )}
            <button
                onClick={handleRegister}
                disabled={isPending}
                className={`w-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] ${isPending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                    }`}
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
                    </>
                ) : (
                    <>
                        Reservar mi lugar <ChevronRight className="h-4 w-4" />
                    </>
                )}
            </button>
        </div>
    )
}
