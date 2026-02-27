import { FORUM_CATEGORIES } from '@/lib/forum-config'
import Link from 'next/link'
import {
    TrendingUp,
    MessageSquare,
    ChevronRight,
    Users
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { FileText, Play, Download, BookOpen } from 'lucide-react'

export default async function ForosPage() {
    const categories = FORUM_CATEGORIES
    const supabase = await createClient()

    // Get current user profile for ampa_id
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('ampa_id')
        .eq('id', user?.id as string)
        .single()

    const profile = profileRaw as any

    // Fetch resources
    const { data: recursos } = await supabase
        .from('recursos')
        .select('*')
        .eq('ampa_id', profile?.ampa_id as string)
        .order('created_at', { ascending: false })
        .limit(4)

    return (
        <div className="space-y-16 pb-16">
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold text-slate-900">Foros de la Comunidad</h2>
                        <p className="mt-2 text-slate-500 text-lg">
                            Espacios temáticos de consulta y apoyo entre familias y expertos.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/dashboard/comunidad/foros/${cat.id}`}
                            className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-50"
                        >
                            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${cat.color} text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="h-7 w-7" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                {cat.name}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">
                                {cat.desc}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> {cat.postCount} hilos
                                    </span>
                                    <span>• {cat.lastPost}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Resources Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Recursos Psicoeducativos</h2>
                        <p className="text-slate-500 mt-1">Guías, talleres y artículos seleccionados por tu AMPA.</p>
                    </div>
                    <button className="text-indigo-600 font-bold hover:underline">Explorar biblioteca</button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {recursos && recursos.length > 0 ? (
                        recursos.map((rec: any) => (
                            <div key={rec.id} className="group overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                                <div className="h-32 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                                    {rec.tipo === 'video' ? <Play className="h-10 w-10 text-indigo-400" /> : <BookOpen className="h-10 w-10 text-indigo-400" />}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100 uppercase text-slate-600">{rec.tipo}</span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{rec.titulo}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{rec.descripcion}</p>
                                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {rec.tipo === 'pdf' ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                        {rec.tipo === 'pdf' ? 'Descargar' : 'Leer recurso'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <p className="text-slate-500 font-medium">No hay recursos publicados recientemente.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Moderation Highlight */}
            <div className="rounded-3xl bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="h-20 w-20 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-800">
                        <Users className="h-10 w-10 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold">Espacio Seguro y Moderado</h4>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Todos nuestros foros están supervisados por personal de la junta y especialistas externos para garantizar un entorno de respeto y ayuda mutua.
                        </p>
                    </div>
                    <button className="md:ml-auto whitespace-nowrap bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                        Normas de la comunidad
                    </button>
                </div>
            </div>
        </div>
    )
}
