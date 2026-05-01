'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Vote,
    Plus,
    Trash2,
    Calendar,
    Type,
    AlignLeft,
    CheckCircle2,
    ChevronLeft,
    Sparkles,
    Loader2,
    Lock
} from 'lucide-react'
import Link from 'next/link'
import { createPoll } from '@/app/actions/polls'

export default function NewPollPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [opciones, setOpciones] = useState(['', ''])

    function addOpcion() {
        if (opciones.length >= 6) return
        setOpciones([...opciones, ''])
    }

    function removeOpcion(index: number) {
        if (opciones.length <= 2) return
        setOpciones(opciones.filter((_, i) => i !== index))
    }

    function handleOpcionChange(index: number, value: string) {
        const newOpciones = [...opciones]
        newOpciones[index] = value
        setOpciones(newOpciones)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            pregunta: formData.get('pregunta') as string,
            descripcion: formData.get('descripcion') as string,
            opciones: opciones.filter(o => o.trim() !== ''),
            termina_at: formData.get('fecha_limite') ? `${formData.get('fecha_limite')}T23:59:59` : undefined,
            anonima: formData.get('anonima') === 'on'
        }

        if (data.opciones.length < 2) {
            setError('Debes añadir al menos 2 opciones válidas')
            setLoading(false)
            return
        }

        try {
            await createPoll(data)
            router.push('/dashboard/votaciones')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al crear la votación')
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/dashboard/votaciones"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-brand transition-colors mb-8 font-medium group"
            >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Volver a votaciones
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Vote className="h-3.5 w-3.5" /> Toma de Decisiones
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Nueva Votación</h1>
                    <p className="mt-4 text-slate-500 text-xl leading-relaxed max-w-xl">
                        Crea encuestas para conocer la opinión de tu AMPA sobre temas escolares.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm text-rose-500">
                            !
                        </div>
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sección Principal */}
                    <div className="space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/10">
                                    <Type className="h-5 w-5" />
                                </div>
                                Pregunta
                            </h2>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">¿Qué quieres consultar?</label>
                                <input
                                    required
                                    name="pregunta"
                                    type="text"
                                    placeholder="Ej: ¿Qué actividad extraescolar prefieres?"
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-bold placeholder:text-slate-300 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contexto (Opcional)</label>
                                <textarea
                                    name="descripcion"
                                    rows={4}
                                    placeholder="Explica el motivo de la votación o detalles relevantes..."
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-medium placeholder:text-slate-300 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Opciones */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-indigo-900/20">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                    Opciones
                                </h2>
                                <button
                                    type="button"
                                    onClick={addOpcion}
                                    className="text-[10px] font-black text-brand/80 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                                >
                                    + Añadir
                                </button>
                            </div>

                            <div className="space-y-4">
                                {opciones.map((opcion, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="flex-1 relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black text-xs">
                                                {index + 1}
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                value={opcion}
                                                onChange={(e) => handleOpcionChange(index, e.target.value)}
                                                placeholder={`Opción ${index + 1}`}
                                                className="w-full bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/20 rounded-[1.2rem] py-3.5 pl-10 pr-4 text-white font-bold placeholder:text-white/20 transition-all"
                                            />
                                        </div>
                                        {opciones.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOpcion(index)}
                                                className="h-10 w-10 rounded-[1rem] bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ajustes Extra */}
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                Configuración
                            </h2>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Límite (Opcional)</label>
                                <input
                                    name="fecha_limite"
                                    type="date"
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-bold transition-all"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            name="anonima"
                                            type="checkbox"
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-brand transition-colors" />
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900">Votación Anónima</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ocultar quién votó cada opción</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-12">
                    <Link
                        href="/dashboard/votaciones"
                        className="rounded-[1.5rem] px-8 py-5 text-sm font-black text-slate-500 hover:bg-slate-100 transition-all"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 rounded-[1.5rem] bg-brand px-12 py-5 text-sm font-black text-white transition-all hover:bg-indigo-700 shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Creando...
                            </>
                        ) : (
                            <>
                                Abrir Votación <CheckCircle2 className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
