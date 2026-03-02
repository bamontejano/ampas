'use client'

import { useState, useTransition } from 'react'
import { toggleAmpaStatus, deleteAmpa, generateAdminCode } from '@/app/actions/superadmin'
import { PowerOff, Power, Trash2, Loader2, KeyRound } from 'lucide-react'

interface AmpaActionsProps {
    ampaId: string
    isActive: boolean
}

export function AmpaActions({ ampaId, isActive }: AmpaActionsProps) {
    const [active, setActive] = useState(isActive)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [adminCode, setAdminCode] = useState<string | null>(null)
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

    const handleGenerateCode = () => {
        setError(null)
        setAdminCode(null)
        startTransition(async () => {
            try {
                const res = await generateAdminCode(ampaId)
                if (res?.codigo) {
                    setAdminCode(res.codigo)
                }
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

            {/* Generate Admin Code */}
            {adminCode ? (
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200">
                    <span className="text-xs font-black uppercase tracking-widest">{adminCode}</span>
                    <button onClick={() => {
                        navigator.clipboard.writeText(adminCode)
                        setAdminCode(null)
                    }} className="text-indigo-400 hover:text-indigo-600" title="Copiar y cerrar">
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleGenerateCode}
                    disabled={isPending}
                    title="Generar código de primer Admin"
                    className="flex items-center justify-center h-8 w-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-all"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                </button>
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
