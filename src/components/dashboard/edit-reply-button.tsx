'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Save, Loader2 } from 'lucide-react'
import { editReply } from '@/app/actions/community'

interface EditReplyButtonProps {
    replyId: string
    postId: string
    categoryId: string
    initialContent: string
}

export default function EditReplyButton({ replyId, postId, categoryId, initialContent }: EditReplyButtonProps) {
    const [editing, setEditing] = useState(false)
    const [content, setContent] = useState(initialContent)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleOpen() {
        setContent(initialContent)
        setError(null)
        setEditing(true)
    }

    function handleCancel() {
        setEditing(false)
        setError(null)
    }

    function handleSave() {
        if (!content.trim()) return
        setError(null)
        startTransition(async () => {
            try {
                await editReply(replyId, postId, categoryId, content.trim())
                setEditing(false)
            } catch (err: any) {
                setError(err.message || 'Error al guardar')
            }
        })
    }

    if (!editing) {
        return (
            <button
                onClick={handleOpen}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-500 font-bold transition-colors"
                title="Editar respuesta"
            >
                <Pencil className="h-3 w-3" />
                Editar
            </button>
        )
    }

    return (
        <div className="mt-4 space-y-3">
            {error && (
                <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">{error}</p>
            )}
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50/30 focus:bg-white focus:outline-none text-slate-900 text-sm resize-none transition-all leading-relaxed"
            />
            <div className="flex items-center gap-2 justify-end">
                <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
                >
                    <X className="h-3 w-3" /> Cancelar
                </button>
                <button
                    onClick={handleSave}
                    disabled={isPending || !content.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Guardar
                </button>
            </div>
        </div>
    )
}
