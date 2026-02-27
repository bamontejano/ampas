'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    Clock,
    MapPin,
    Type,
    AlignLeft,
    Users,
    Video,
    Image as ImageIcon,
    ChevronLeft,
    Sparkles,
    Loader2,
    X
} from 'lucide-react'
import Link from 'next/link'
import { createEvent } from '@/app/actions/events'
import { createClient } from '@/lib/supabase/client'

export default function NewEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        let finalImageUrl = formData.get('imagen_url') as string

        try {
            // 1. Upload image if exists
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `events/${fileName}`

                const { error: uploadError, data } = await supabase.storage
                    .from('recursos')
                    .upload(filePath, imageFile)

                if (uploadError) throw new Error('Error al subir la imagen')

                const { data: { publicUrl } } = supabase.storage
                    .from('recursos')
                    .getPublicUrl(filePath)

                finalImageUrl = publicUrl
            }

            const data = {
                titulo: formData.get('titulo'),
                descripcion: formData.get('descripcion'),
                fecha_inicio: `${formData.get('fecha')}T${formData.get('hora_inicio')}`,
                fecha_fin: formData.get('hora_fin') ? `${formData.get('fecha')}T${formData.get('hora_fin')}` : null,
                lugar: formData.get('lugar'),
                tipo: formData.get('tipo'),
                max_asistentes: formData.get('max_asistentes'),
                imagen_url: finalImageUrl,
            }

            await createEvent(data)
            router.push('/dashboard/eventos')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al crear el evento')
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/dashboard/eventos"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium group"
            >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Volver al calendario
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-4">
                        <Sparkles className="h-3 w-3" /> Panel de Gestión
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Crear Nuevo Evento</h1>
                    <p className="mt-4 text-slate-500 text-xl leading-relaxed max-w-xl">
                        Organiza talleres, charlas o reuniones para tu comunidad educativa.
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
                                <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <Type className="h-5 w-5" />
                                </div>
                                Detalles Básicos
                            </h2>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título del evento</label>
                                <input
                                    required
                                    name="titulo"
                                    type="text"
                                    placeholder="Ej: Taller de Disciplina Positiva"
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-bold placeholder:text-slate-300 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                                <textarea
                                    required
                                    name="descripcion"
                                    rows={4}
                                    placeholder="Describe de qué trata el evento, quién lo imparte..."
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-medium placeholder:text-slate-300 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Imagen del Evento</label>

                                {imagePreview ? (
                                    <div className="relative rounded-[2rem] overflow-hidden border-2 border-indigo-100 shadow-lg">
                                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/90 text-rose-500 flex items-center justify-center shadow-md hover:bg-white transition-all scale-100 active:scale-95"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-48 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:bg-slate-100 transition-all group"
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Subir Cartel del Evento</span>
                                    </button>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <div className="relative group">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        name="imagen_url"
                                        type="url"
                                        placeholder="O pega una URL de imagen..."
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] py-4 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fecha y Lugar */}
                    <div className="space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                Cuándo y Dónde
                            </h2>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                                <input
                                    required
                                    name="fecha"
                                    type="date"
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-bold transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hora Inicio</label>
                                    <input
                                        required
                                        name="hora_inicio"
                                        type="time"
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-bold transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hora Fin</label>
                                    <input
                                        name="hora_fin"
                                        type="time"
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] p-4 text-slate-900 font-bold transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Lugar / Link</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        required
                                        name="lugar"
                                        type="text"
                                        placeholder="Salón de actos / Link de Zoom"
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 rounded-[1.5rem] py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ajustes Extra */}
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-indigo-900/20">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
                                    <Users className="h-5 w-5" />
                                </div>
                                Capacidad y Tipo
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tipo de Evento</label>
                                    <select
                                        name="tipo"
                                        className="w-full bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/20 rounded-[1.2rem] p-4 text-white font-bold transition-all appearance-none"
                                    >
                                        <option value="presencial" className="text-slate-900">Presencial</option>
                                        <option value="online" className="text-slate-900">Online</option>
                                        <option value="hibrido" className="text-slate-900">Híbrido</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Máx. Asistentes</label>
                                    <input
                                        name="max_asistentes"
                                        type="number"
                                        placeholder="Ej: 50"
                                        className="w-full bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/20 rounded-[1.2rem] p-4 text-white font-bold placeholder:text-white/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-12">
                    <Link
                        href="/dashboard/eventos"
                        className="rounded-[1.5rem] px-8 py-5 text-sm font-black text-slate-500 hover:bg-slate-100 transition-all"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 rounded-[1.5rem] bg-indigo-600 px-12 py-5 text-sm font-black text-white transition-all hover:bg-indigo-700 shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Publicando...
                            </>
                        ) : (
                            <>
                                Publicar Evento <ChevronLeft className="h-5 w-5 rotate-180" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
