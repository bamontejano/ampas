'use client'

import { useState, useTransition } from 'react'
import { User, Send, AlertCircle } from 'lucide-react'
import { addReply } from '@/app/actions/community'

interface ReplyFormProps {
    postId: string
    categoryId: string
}

export default function ReplyForm({ postId, categoryId }: ReplyFormProps) {
    const [isPending, startTransition] = useTransition()
    const [content, setContent] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!content.trim()) return

        setError(null)
        const formData = new FormData()
        formData.append('postId', postId)
        formData.append('categoryId', categoryId)
        formData.append('content', content)

        startTransition(async () => {
            try {
                await addReply(formData)
                setContent('')
            } catch (err: any) {
                setError(err.message || 'Error al enviar la respuesta')
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/10 space-y-4">
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-4">
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe tu respuesta o consejo..."
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-200 focus:ring-0 transition-all text-slate-900 placeholder:text-slate-400 resize-none leading-relaxed"
                        rows={4}
                    ></textarea>
                    <div className="flex justify-end">
                        <button
                            disabled={isPending || !content.trim()}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPending ? 'Enviando...' : (
                                <>
                                    Enviar respuesta
                                    <Send className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
