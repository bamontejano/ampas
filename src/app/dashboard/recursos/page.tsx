
import { createClient } from '@/lib/supabase/server'
import {
    BookOpen,
    FileText,
    Video,
    Download,
    Search,
    Filter,
    Plus,
    Tag,
    ChevronRight,
    Sparkles,
    Calendar,
    GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { Recurso } from '@/types/database'
import ResourceUploadModal from '@/components/dashboard/resource-upload-modal'
import { deleteResource } from '@/app/actions/resources'
import { Trash2 } from 'lucide-react'

export default async function RecursosPage({
    searchParams
}: {
    searchParams: { q?: string, tipo?: string }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user?.id as string)
        .single()

    const q = searchParams.q || ''
    const tipo = searchParams.tipo || ''

    // Query recursos for the specific AMPA or public ones
    let query = supabase
        .from('recursos')
        .select('*')
        .or(`ampa_id.eq.${profile?.ampa_id},publico.eq.true`)

    if (q) {
        query = query.ilike('titulo', `%${q}%`)
    }

    if (tipo) {
        query = query.eq('tipo', tipo)
    }

    const { data: recursosRaw } = await query.order('created_at', { ascending: false })

    const recursos = (recursosRaw || []) as Recurso[]
    const destacados = recursos.filter(r => r.destacado)

    const canCreate = ['admin_ampa', 'junta', 'superadmin'].includes(profile?.rol || '')

    const types = [
        { id: 'guia', label: 'Guías', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'pdf', label: 'PDFs', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'video', label: 'Videos', icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ]

    return (
        <div className="mx-auto max-w-7xl space-y-10 pb-20">
            {/* Header Section */}
            <header className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-16 text-white shadow-2xl">
                <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        Biblioteca Digital
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                        Recursos para <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">una Crianza Consciente</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                        Explora nuestra colección curada de guías, talleres grabados y materiales prácticos para acompañar el desarrollo de tus hijos.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <form className="flex-1 min-w-[300px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={q}
                                placeholder="Buscar por tema o título..."
                                className="w-full rounded-2xl bg-white/10 border-none py-4 pl-12 pr-4 text-sm font-medium focus:bg-white/20 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 text-white"
                            />
                        </form>
                        {canCreate && (
                            <ResourceUploadModal ampaId={profile?.ampa_id as string} />
                        )}
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]"></div>
                <div className="absolute right-20 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]"></div>
            </header>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {types.map((t) => (
                    <Link
                        key={t.id}
                        href={`/dashboard/recursos?tipo=${t.id}`}
                        className={`flex flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 shadow-xl transition-all text-center group cursor-pointer border ${tipo === t.id ? 'bg-white border-indigo-200 shadow-indigo-100' : 'bg-white border-slate-100 shadow-slate-200/40 hover:scale-105'}`}
                    >
                        <div className={`h-16 w-16 rounded-2xl ${t.bg} ${t.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                            <t.icon className="h-8 w-8" />
                        </div>
                        <span className="font-black text-slate-900 uppercase text-xs tracking-widest">{t.label}</span>
                    </Link>
                ))}
                <Link
                    href="/dashboard/recursos"
                    className={`flex flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 shadow-xl transition-all text-center group cursor-pointer border ${!tipo ? 'bg-indigo-600 border-indigo-600 shadow-indigo-200 text-white' : 'bg-white border-slate-100 shadow-slate-200/40 hover:scale-105'}`}
                >
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform ${!tipo ? 'bg-white/20' : 'bg-indigo-600 text-white'}`}>
                        <Filter className="h-8 w-8" />
                    </div>
                    <span className={`font-black uppercase text-xs tracking-widest ${!tipo ? 'text-white' : 'text-slate-900'}`}>{!tipo ? 'Viendo Todos' : 'Ver Todos'}</span>
                </Link>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recursos Recientes</h3>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Mostrando {recursos.length} resultados
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {recursos.map((recurso) => (
                            <div key={recurso.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 p-4 transition-all hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 flex flex-col md:flex-row gap-6">
                                <div className="h-48 md:h-auto md:w-64 shrink-0 rounded-[2rem] overflow-hidden relative">
                                    {recurso.imagen_url ? (
                                        <img src={recurso.imagen_url} alt={recurso.titulo} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-50 flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-slate-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900">
                                        {recurso.tipo}
                                    </div>
                                </div>

                                <div className="flex-1 py-4 pr-6 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {recurso.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{tag}</span>
                                            ))}
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {recurso.titulo}
                                        </h4>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                            {recurso.descripcion}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(recurso.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                            </div>
                                            {recurso.etapa_educativa && (
                                                <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                    {recurso.etapa_educativa[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {canCreate && (
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteResource(recurso.id)
                                                }}>
                                                    <button className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all active:scale-90">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </form>
                                            )}
                                            <a
                                                href={recurso.archivo_url || '#'}
                                                target="_blank"
                                                className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-90 shadow-xl shadow-slate-200"
                                            >
                                                <Download className="h-5 w-5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {recursos.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                    <BookOpen className="h-10 w-10 text-slate-200" />
                                </div>
                                <p className="text-slate-500 font-bold text-lg">Aún no hay recursos disponibles.</p>
                                <p className="text-slate-400 text-sm mt-1">Vuelve pronto para descubrir nuevos contenidos.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-10">
                    {/* Featured / Destacados */}
                    {destacados.length > 0 && (
                        <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                            <h3 className="relative z-10 text-xs font-black uppercase tracking-widest text-indigo-200 mb-6 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Recomendados
                            </h3>
                            <div className="relative z-10 space-y-6">
                                {destacados.slice(0, 3).map(dest => (
                                    <Link key={dest.id} href="#" className="block group">
                                        <h4 className="text-sm font-bold group-hover:text-indigo-200 transition-colors line-clamp-2">{dest.titulo}</h4>
                                        <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200/60">
                                            <span>{dest.tipo}</span>
                                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <div className="mt-4 border-t border-white/10"></div>
                                    </Link>
                                ))}
                            </div>
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                        </div>
                    )}

                    {/* Tags Cloud */}
                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40">
                        <h3 className="mb-6 font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest">
                            <Tag className="h-4 w-4 text-indigo-500" />
                            Temas Populares
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['Autoestima', 'Adolescencia', 'Límites', 'Redes Sociales', 'Bullying', 'Ansiedad', 'Crianza', 'Estudios'].map(tag => (
                                <button key={tag} className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Needs Help Section */}
                    <div className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50/50 p-8 text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200 rotate-3">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">¿No encuentras lo que buscas?</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Ponte en contacto con la junta de tu AMPA para sugerir nuevos temas o materiales.
                        </p>
                        <button className="w-full rounded-xl bg-white border border-indigo-100 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                            Sugerir Tema
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}
