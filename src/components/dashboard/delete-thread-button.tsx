'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteThread } from '@/app/actions/community'

interface DeleteThreadButtonProps {
    postId: string
    categoryId: string
    variant?: 'icon' | 'full'
}

export default function DeleteThreadButton({ postId, categoryId, variant = 'icon' }: DeleteThreadButtonProps) {
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        setLoading(true)
        try {
            await deleteThread(postId, categoryId)
        } catch {
            setLoading(false)
            setConfirming(false)
        }
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
                <span className="text-xs text-slate-500 font-medium">¿Borrar hilo?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sí, borrar'}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
                >
                    Cancelar
                </button>
            </div>
        )
    }

    if (variant === 'full') {
        return (
            <button
                onClick={e => { e.preventDefault(); setConfirming(true) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 transition-all border border-rose-100"
            >
                <Trash2 className="h-4 w-4" />
                Borrar hilo
            </button>
        )
    }

    return (
        <button
            onClick={e => { e.preventDefault(); setConfirming(true) }}
            className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
            title="Borrar hilo"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    )
}
