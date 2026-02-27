'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Users
} from 'lucide-react'
import { formatDateRelative } from '@/lib/utils'
import Link from 'next/link'
import { toggleLikeAction } from '@/app/actions/community'

export default function RealtimeFeed({
    initialPosts,
    ampaId,
    initialLikedPosts = []
}: {
    initialPosts: any[],
    ampaId: string,
    initialLikedPosts?: string[]
}) {
    const [posts, setPosts] = useState<any[]>(initialPosts)
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(initialLikedPosts))
    const supabase = createClient()

    useEffect(() => {
        setPosts(initialPosts)
    }, [initialPosts])

    useEffect(() => {
        setLikedPosts(new Set(initialLikedPosts))
    }, [initialLikedPosts])

    useEffect(() => {
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'posts',
                    filter: `ampa_id=eq.${ampaId}`
                },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Fetch the full post with profile data for the new insert
                        const { data: newPost } = await supabase
                            .from('posts')
                            .select('*, profiles:autor_id(nombre_completo, avatar_url, rol)')
                            .eq('id', payload.new.id)
                            .single()

                        if (newPost) {
                            setPosts((prev) => [newPost, ...prev])
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setPosts((prev) => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [ampaId, supabase])

    const toggleLike = async (postId: string) => {
        // Optimistic update
        const isLiked = likedPosts.has(postId)
        setLikedPosts(prev => {
            const next = new Set(prev)
            if (isLiked) next.delete(postId)
            else next.add(postId)
            return next
        })

        try {
            await toggleLikeAction(postId)
        } catch (err) {
            // Revert on error
            setLikedPosts(prev => {
                const next = new Set(prev)
                if (isLiked) next.add(postId)
                else next.delete(postId)
                return next
            })
        }
    }

    return (
        <div className="space-y-8 mt-8">
            {posts.map((post) => {
                const isLiked = likedPosts.has(post.id)
                const avatar = post.profiles?.avatar_url
                const name = post.profiles?.nombre_completo || 'Usuario de AMPA'

                return (
                    <div key={post.id} className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:shadow-slate-200/60">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                        {avatar ? (
                                            <img src={avatar} alt={name} className="h-full w-full object-cover" />
                                        ) : (
                                            name[0]
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-900 leading-tight">{name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                {post.profiles?.rol === 'junta' ? 'Junta' : 'Familia'}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {formatDateRelative(post.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <p className="text-slate-700 text-lg leading-relaxed font-medium">
                                    {post.contenido}
                                </p>

                                {post.imagen_url && (
                                    <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner">
                                        <img src={post.imagen_url} alt="Post media" className="w-full h-auto object-cover max-h-[30rem]" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2 md:gap-6">
                                    <button
                                        onClick={() => toggleLike(post.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${isLiked ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-rose-500 scale-110' : ''}`} />
                                        <span className="text-xs font-black uppercase tracking-widest">{post.likes_count + (isLiked ? 1 : 0) || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-widest">{post.comentarios_count || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Comment Prompt */}
                            <div className="mt-6 flex items-center gap-4 bg-slate-50/50 p-2 pl-4 rounded-[1.5rem] border border-slate-100/50">
                                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 italic">
                                    C
                                </div>
                                <input
                                    type="text"
                                    placeholder="Escribe un comentario..."
                                    className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-slate-400 focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                )
            })}

            {posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center px-10">
                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-slate-500 font-bold text-lg">Aún no hay publicaciones en tu comunidad.</p>
                    <p className="text-slate-400 text-sm mt-1">¡Sé el primero en compartir algo!</p>
                </div>
            )}
        </div>
    )
}
