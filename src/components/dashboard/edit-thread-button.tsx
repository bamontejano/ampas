'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Save, Loader2 } from 'lucide-react'
import { editThread } from '@/app/actions/community'

interface EditThreadButtonProps {
    postId: string
    categoryId: string
    initialTitle: string
    initialContent: string
}

export default function EditThreadButton({ postId, categoryId, initialTitle, initialContent }: EditThreadButtonProps) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleOpen() {
        setTitle(initialTitle)
        setContent(initialContent)
        setError(null)
        setEditing(true)
    }

    function handleCancel() {
        setEditing(false)
        setError(null)
    }

    function handleSave() {
        if (!title.trim() || !content.trim()) return
        setError(null)
        startTransition(async () => {
            try {
                await editThread(postId, categoryId, title.trim(), content.trim())
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all border border-slate-100"
            >
                <Pencil className="h-4 w-4" />
                Editar hilo
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Editar hilo</h3>
                    <button onClick={handleCancel} className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100">{error}</p>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-300 focus:outline-none text-slate-900 text-sm transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contenido</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-300 focus:outline-none text-slate-900 text-sm resize-none transition-all leading-relaxed"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        disabled={isPending}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending || !title.trim() || !content.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    )
}
