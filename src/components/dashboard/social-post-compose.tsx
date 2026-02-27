'use client'

import { useState, useTransition, useRef } from 'react'
import { Image as ImageIcon, Send, Loader2, Smile, MapPin, Video, X } from 'lucide-react'
import { createSocialPost } from '@/app/actions/community'
import { createClient } from '@/lib/supabase/client'

export default function SocialPostCompose({ userAvatar, userName }: { userAvatar?: string | null, userName: string }) {
    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [isExpanded, setIsExpanded] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            setIsExpanded(true)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    async function handlePost() {
        if (!content.trim() && !imageFile) return
        if (isPending) return

        startTransition(async () => {
            try {
                let imageUrl = undefined

                if (imageFile) {
                    const fileExt = imageFile.name.split('.').pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `post-images/${fileName}`

                    const { error: uploadError, data } = await supabase.storage
                        .from('posts')
                        .upload(filePath, imageFile)

                    if (uploadError) throw uploadError

                    // Obtener la URL pública
                    const { data: { publicUrl } } = supabase.storage
                        .from('posts')
                        .getPublicUrl(filePath)

                    imageUrl = publicUrl
                }

                await createSocialPost(content, imageUrl)
                setContent('')
                setImageFile(null)
                setImagePreview(null)
                setIsExpanded(false)
            } catch (err) {
                console.error(err)
                alert('No se pudo publicar el post')
            }
        })
    }

    return (
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 transition-all">
            <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
                    ) : (
                        userName[0]
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        placeholder={`¿Qué tienes en mente, ${userName.split(' ')[0]}?`}
                        rows={isExpanded ? 3 : 1}
                        className="w-full resize-none border-none bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 text-lg font-medium leading-relaxed"
                    />

                    {imagePreview && (
                        <div className="relative mt-2 rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm inline-block">
                            <img src={imagePreview} alt="Preview" className="max-h-60 w-auto object-cover" />
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1.5 bg-slate-900/50 text-white rounded-full hover:bg-slate-900 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    {isExpanded && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1 md:gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 transition-all group"
                                >
                                    <ImageIcon className="h-5 w-5 text-emerald-500 transition-transform group-hover:scale-110" />
                                    <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Foto</span>
                                </button>
                                <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 transition-all group">
                                    <Video className="h-5 w-5 text-indigo-500 transition-transform group-hover:scale-110" />
                                    <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Video</span>
                                </button>
                                <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 transition-all group">
                                    <Smile className="h-5 w-5 text-amber-500 transition-transform group-hover:scale-110" />
                                    <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Estado</span>
                                </button>
                            </div>

                            <button
                                onClick={handlePost}
                                disabled={(!content.trim() && !imageFile) || isPending}
                                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Publicar <Send className="h-3.5 w-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {!isExpanded && (
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        <ImageIcon className="h-4 w-4" /> Imagen
                    </button>
                    <button onClick={() => setIsExpanded(true)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        <Video className="h-4 w-4" /> Video
                    </button>
                    <button onClick={() => setIsExpanded(true)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        <MapPin className="h-4 w-4" /> Ubicación
                    </button>
                </div>
            )}
        </div>
    )
}
