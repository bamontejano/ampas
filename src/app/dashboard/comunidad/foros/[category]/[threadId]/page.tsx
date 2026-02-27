import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft, Heart, MessageSquare, Share2, MoreVertical, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import ReplyForm from '@/components/dashboard/reply-form'

interface ThreadPageProps {
    params: Promise<{ category: string; threadId: string }>
}

export default async function ThreadPage({ params }: ThreadPageProps) {
    const { category, threadId } = await params
    const supabase = await createClient()

    // Fetch post details
    const { data: threadRaw, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:autor_id (
                nombre_completo,
                avatar_url,
                rol,
                bio
            )
        `)
        .eq('id', threadId)
        .single()

    const thread = threadRaw as any

    // Fetch comments
    const { data: comments } = await supabase
        .from('comentarios')
        .select(`
            *,
            profiles:autor_id (
                nombre_completo,
                avatar_url,
                rol
            )
        `)
        .eq('post_id', threadId)
        .order('created_at', { ascending: true })

    if (error || !thread) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">No se pudo encontrar el hilo</h2>
                <Link
                    href={`/dashboard/comunidad/foros/${category}`}
                    className="text-indigo-600 font-bold hover:underline"
                >
                    Volver al foro
                </Link>
            </div>
        )
    }

    const [title, ...contentLines] = thread.contenido.split('\n')
    const mainContent = contentLines.join('\n').trim() || thread.contenido

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
            <Link
                href={`/dashboard/comunidad/foros/${category}`}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit"
            >
                <ChevronLeft className="h-4 w-4" />
                Volver al foro
            </Link>

            <article className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/20 overflow-hidden">
                <div className="p-8 md:p-12 space-y-8">
                    <header className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-slate-50">
                                    {(thread.profiles as any)?.avatar_url ? (
                                        <img src={(thread.profiles as any).avatar_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">
                                            <User className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        {(thread.profiles as any)?.nombre_completo || 'Usuario de la comunidad'}
                                        {(thread.profiles as any)?.rol === 'junta' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">Junta</span>
                                        )}
                                    </span>
                                    <span className="text-sm text-slate-400">
                                        Publicado {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                            </div>
                            <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-colors">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                            {title}
                        </h1>
                    </header>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-xl text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {mainContent}
                        </p>
                    </div>

                    {thread.imagen_url && (
                        <div className="rounded-3xl bg-slate-100 overflow-hidden border border-slate-200">
                            <img src={thread.imagen_url} alt="" className="w-full h-auto object-cover max-h-[500px]" />
                        </div>
                    )}

                    <footer className="flex flex-wrap items-center gap-6 pt-8 border-t border-slate-50">
                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all border border-rose-100">
                            <Heart className="h-5 w-5" />
                            {thread.likes_count || 0} Me gusta
                        </button>
                        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                            <MessageSquare className="h-5 w-5" />
                            {comments?.length || thread.comentarios_count || 0} Respuestas
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-all border border-slate-100">
                            <Share2 className="h-5 w-5" />
                            Compartir
                        </button>
                    </footer>
                </div>
            </article>

            {/* Replied Section */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 ml-4">Respuestas de la comunidad</h3>

                <ReplyForm postId={threadId} categoryId={category} />

                <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                        comments.map((comment: any) => (
                            <div key={comment.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white">
                                        {comment.profiles?.avatar_url ? (
                                            <img src={comment.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50 font-bold text-xs">
                                                {comment.profiles?.nombre_completo?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">
                                            {comment.profiles?.nombre_completo || 'Usuario'}
                                            {comment.profiles?.rol === 'junta' && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">Junta</span>
                                            )}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                                    {comment.contenido}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="bg-slate-50/50 p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center border border-slate-100">
                                <MessageSquare className="h-8 w-8 text-slate-300" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">Aún no hay respuestas</h4>
                                <p className="text-slate-500 mt-1 max-w-sm">
                                    Sé el primero en aconsejar o compartir tu opinión.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
