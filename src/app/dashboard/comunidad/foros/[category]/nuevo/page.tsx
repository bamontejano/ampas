'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, Image as ImageIcon, MessageSquare, AlertCircle } from 'lucide-react'
import { createThread } from '@/app/actions/community'
import { getCategoryById } from '@/lib/forum-config'
import { useState, useTransition } from 'react'

export default function NewThreadPage() {
    const params = useParams()
    const router = useRouter()
    const category = params.category as string
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const categoryInfo = getCategoryById(category) || { name: 'Foro Temático', color: 'bg-slate-500', icon: MessageSquare }

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            try {
                await createThread(formData)
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error al crear el hilo. Por favor, inténtalo de nuevo.')
            }
        })
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            <div className="flex flex-col gap-4">
                <Link
                    href={`/dashboard/comunidad/foros/${category}`}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Volver al foro
                </Link>

                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${categoryInfo.color} text-white shadow-lg`}>
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Nuevo hilo en {categoryInfo.name}</h2>
                        <p className="text-slate-500">Comparte tu duda o experiencia con la comunidad.</p>
                    </div>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <input type="hidden" name="categoryId" value={category} />

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/20 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-bold text-slate-700 ml-1">
                            Título del hilo
                        </label>
                        <input
                            required
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Ej: ¿Cómo establecer límites con el móvil en la cena?"
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-200 focus:ring-0 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="content" className="block text-sm font-bold text-slate-700 ml-1">
                            Descripción detallada
                        </label>
                        <textarea
                            required
                            id="content"
                            name="content"
                            rows={8}
                            placeholder="Cuéntanos más detalles sobre tu consulta. Cuanto más específico seas, mejor podrá ayudarte la comunidad..."
                            className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-200 focus:ring-0 transition-all text-slate-900 placeholder:text-slate-400 resize-none leading-relaxed"
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
                        >
                            <ImageIcon className="h-4 w-4" />
                            Adjuntar imagen
                        </button>
                        <p className="text-xs text-slate-400">
                            Máximo 5MB • Formatos JPG, PNG
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href={`/dashboard/comunidad/foros/${category}`}
                        className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        disabled={isPending}
                        type="submit"
                        className="flex items-center gap-2 bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isPending ? (
                            'Publicando...'
                        ) : (
                            <>
                                Publicar hilo
                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Consejos para un buen hilo
                </h4>
                <ul className="text-sm text-amber-700 space-y-1 list-disc ml-5">
                    <li>Usa un título descriptivo y claro.</li>
                    <li>SÉ respetuoso con el resto de familias.</li>
                    <li>Evita compartir datos personales sensibles (nombres completos de menores, teléfonos).</li>
                    <li>Este espacio es de ayuda mutua, no para publicidad.</li>
                </ul>
            </div>
        </div>
    )
}
