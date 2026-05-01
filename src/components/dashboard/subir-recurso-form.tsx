'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Upload,
    X,
    FileText,
    Video,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react'

export default function SubirRecursoForm({ ampaId }: { ampaId: string }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)

    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const titulo = formData.get('titulo') as string
        const descripcion = formData.get('descripcion') as string
        const tipo = formData.get('tipo') as string
        const etapa = formData.get('etapa') as string
        const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean)
        const destacado = formData.get('destacado') === 'on'

        try {
            let archivoUrl = null

            if (file) {
                // 1. Subir a Supabase Storage
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `${ampaId}/${fileName}`

                const { error: uploadError, data } = await supabase.storage
                    .from('recursos')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('recursos')
                    .getPublicUrl(filePath)

                archivoUrl = publicUrl
            }

            // 2. Insertar en la tabla de recursos
            const { error: dbError } = await supabase
                .from('recursos')
                .insert({
                    titulo,
                    descripcion,
                    tipo: tipo as any,
                    etapa_educativa: [etapa],
                    ampa_id: ampaId,
                    archivo_url: archivoUrl,
                    tags,
                    destacado,
                    publico: true
                })

            if (dbError) throw dbError

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                window.location.reload()
            }, 2000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Añadir Nuevo Recurso</h3>

            {success && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-bold">Recurso publicado con éxito</span>
                </div>
            )}

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700 border border-rose-100">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Título del recurso</label>
                    <input
                        name="titulo"
                        required
                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                        placeholder="Ej: Guía de límites en redes sociales"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Tipo</label>
                        <select name="tipo" className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand transition-all">
                            <option value="articulo">Artículo / Texto</option>
                            <option value="pdf">Documento PDF</option>
                            <option value="video">Vídeo Embebido</option>
                            <option value="guia">Guía Interactiva</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Etapa Educativa</label>
                        <select name="etapa" className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand transition-all">
                            <option value="infantil">Infantil</option>
                            <option value="primaria">Primaria</option>
                            <option value="eso">ESO</option>
                            <option value="bachillerato">Bachillerato</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Descripción corta</label>
                    <textarea
                        name="descripcion"
                        rows={3}
                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                        placeholder="Explica brevemente qué aprenderán las familias..."
                    ></textarea>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Etiquetas (separadas por comas)</label>
                    <input
                        name="tags"
                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                        placeholder="Autoestima, Límites, Tecnología..."
                    />
                </div>

                <div className="flex items-center gap-3 p-4 bg-brand/10/50 rounded-2xl border border-brand/10">
                    <input
                        type="checkbox"
                        id="destacado"
                        name="destacado"
                        className="h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand"
                    />
                    <label htmlFor="destacado" className="text-sm font-bold text-slate-700 select-none">
                        Marcar como recurso destacado <span className="text-[10px] text-brand block font-medium">Aparecerá en la sección de recomendados</span>
                    </label>
                </div>

                <div className="relative">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Archivo (Máx 10MB)</label>
                    <div className={`mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${file ? 'border-indigo-300 bg-brand/10/30' : 'border-slate-200 bg-slate-50/30'} p-8 transition-all`}>
                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileText className="h-10 w-10 text-brand mb-2" />
                                <span className="text-sm font-bold text-slate-700">{file.name}</span>
                                <button type="button" onClick={() => setFile(null)} className="mt-2 text-xs font-bold text-rose-500 hover:underline">Eliminar archivo</button>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-slate-300 mb-2" />
                                <p className="text-sm font-medium text-slate-500">Arrastra o selecciona un archivo</p>
                                <input
                                    type="file"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </>
                        )}
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-sm font-bold text-white transition-all hover:bg-brand disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-brand/10"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>Publicar Recurso</>
                    )}
                </button>
            </form>
        </div>
    )
}
