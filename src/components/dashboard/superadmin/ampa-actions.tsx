'use client'

import { useState, useTransition } from 'react'
import { toggleAmpaStatus, deleteAmpa } from '@/app/actions/superadmin'
import { PowerOff, Power, Trash2, Loader2 } from 'lucide-react'

interface AmpaActionsProps {
    ampaId: string
    isActive: boolean
}

export function AmpaActions({ ampaId, isActive }: AmpaActionsProps) {
    const [active, setActive] = useState(isActive)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        setError(null)
        startTransition(async () => {
            try {
                await toggleAmpaStatus(ampaId, active)
                setActive(v => !v)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    const handleDelete = () => {
        setShowConfirm(false)
        setError(null)
        startTransition(async () => {
            try {
                await deleteAmpa(ampaId)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {error && (
                <span className="text-xs text-rose-500 font-medium max-w-[140px] truncate" title={error}>
                    {error}
                </span>
            )}

            {/* Toggle Active */}
            <button
                onClick={handleToggle}
                disabled={isPending}
                title={active ? 'Desactivar AMPA' : 'Activar AMPA'}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${active
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                    }`}
            >
                {isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : active
                        ? <Power className="h-3.5 w-3.5" />
                        : <PowerOff className="h-3.5 w-3.5" />
                }
                {active ? 'Activa' : 'Inactiva'}
            </button>

            {/* Delete */}
            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isPending}
                    title="Eliminar AMPA"
                    className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            ) : (
                <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">¿Eliminar?</span>
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="rounded-lg bg-rose-500 px-2 py-1 text-xs font-black text-white hover:bg-rose-600 transition-colors"
                    >
                        Sí
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        No
                    </button>
                </div>
            )}
        </div>
    )
}
