import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    MessageSquare,
    ChevronLeft,
    PlusCircle,
    Heart,
    Share2,
    Search,
    Filter,
    Clock,
    User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface CategoryPageProps {
    params: Promise<{ category: string }>
}

import { FORUM_CATEGORIES, getCategoryById } from '@/lib/forum-config'

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params
    const categoryInfo = getCategoryById(category) || { name: 'Foro Temático', color: 'bg-slate-500', icon: MessageSquare }
    const supabase = await createClient()

    // Get current user to filter by ampa_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>No autorizado</div>

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id')
        .eq('id', user.id)
        .single()

    const ampaId = profile?.ampa_id

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:autor_id (
                nombre_completo,
                avatar_url,
                rol
            )
        `)
        .eq('ampa_id', ampaId as string)
        .eq('foro_categoria_id', category)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 pb-16">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/dashboard/comunidad"
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Volver a Comunidad
                </Link>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${categoryInfo.color} text-white shadow-xl`}>
                            {/* In a real implementation we'd map the icon correctly */}
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">{categoryInfo.name}</h2>
                            <p className="mt-1 text-slate-500">
                                Discusiones y consultas de la comunidad.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={`/dashboard/comunidad/foros/${category}/nuevo`}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Crear nuevo hilo
                    </Link>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar hilos..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-200 focus:ring-0 transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm">
                        <Filter className="h-4 w-4" />
                        Recientes
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm">
                        <Clock className="h-4 w-4" />
                        Sin respuesta
                    </button>
                </div>
            </div>

            {/* Threads List */}
            <div className="grid gap-4">
                {posts && posts.length > 0 ? (
                    posts.map((post: any) => (
                        <Link
                            key={post.id}
                            href={`/dashboard/comunidad/foros/${category}/${post.id}`}
                            className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all"
                        >
                            <div className="flex gap-4">
                                <div className="hidden sm:flex flex-col items-center gap-1 min-w-[3rem]">
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                        <Heart className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">{post.likes_count || 0}</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white">
                                            {post.profiles?.avatar_url ? (
                                                <img src={post.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">
                                                    <User className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">
                                                {post.profiles?.nombre_completo || 'Usuario de la comunidad'}
                                                {post.profiles?.rol === 'junta' && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">Junta</span>
                                                )}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {post.contenido.split('\n')[0].substring(0, 100)}...
                                    </h3>

                                    <p className="text-slate-500 line-clamp-2 text-sm leading-relaxed">
                                        {post.contenido.split('\n').slice(1).join(' ') || post.contenido}
                                    </p>

                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="text-xs font-bold">{post.comentarios_count || 0} respuestas</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Share2 className="h-4 w-4" />
                                            <span className="text-xs font-bold">Compartir</span>
                                        </div>
                                    </div>
                                </div>

                                {post.imagen_url && (
                                    <div className="hidden md:block h-24 w-24 rounded-2xl bg-slate-100 overflow-hidden">
                                        <img src={post.imagen_url} alt="" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-white p-16 rounded-[2.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <MessageSquare className="h-10 w-10 text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">No hay hilos todavía</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">
                                Sé el primero en iniciar una conversación en esta categoría. Las dudas compartidas ayudan a toda la comunidad.
                            </p>
                        </div>
                        <Link
                            href={`/dashboard/comunidad/foros/${category}/nuevo`}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4"
                        >
                            Comenzar un hilo
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
