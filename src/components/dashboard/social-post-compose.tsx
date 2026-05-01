'use client'

import { useState, useTransition, useRef } from 'react'
import { ImageIcon, Send, Loader2, Smile, MapPin, Video, X, Link as LinkIcon, Sparkles, Globe } from 'lucide-react'
import { createSocialPost } from '@/app/actions/community'
import { createClient } from '@/lib/supabase/client'

const MOODS = [
    { emoji: '😊', label: 'Feliz' },
    { emoji: '💡', label: 'Inspirado' },
    { emoji: '📝', label: 'Informando' },
    { emoji: '🙌', label: 'Orgulloso' },
    { emoji: '⚖️', label: 'Debatiendo' },
    { emoji: '🚩', label: 'Importante' }
]

const POPULAR_EMOJIS = ['😀', '😍', '👏', '🔥', '💡', '🎉', '👋', '💙', '🙌', '🙏', '✨', '📝', '🏫', '👪', '☀️']

export default function SocialPostCompose({ 
    userAvatar, 
    userName,
    isSuperadmin = false 
}: { 
    userAvatar?: string | null, 
    userName: string,
    isSuperadmin?: boolean
}) {
    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [videoUrl, setVideoUrl] = useState('')
    const [showVideoInput, setShowVideoInput] = useState(false)
    const [selectedMood, setSelectedMood] = useState<{ emoji: string, label: string } | null>(null)
    const [showMoods, setShowMoods] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isGlobal, setIsGlobal] = useState(false)
    
    const [isPending, startTransition] = useTransition()
    const [isExpanded, setIsExpanded] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const addEmoji = (emoji: string) => {
        setContent(prev => prev + emoji)
        setShowEmojiPicker(false)
    }

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
        if (!content.trim() && !imageFile && !videoUrl) return
        if (isPending) return

        startTransition(async () => {
            try {
                let imageUrl = undefined

                if (imageFile) {
                    const fileExt = imageFile.name.split('.').pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `post-images/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('posts')
                        .upload(filePath, imageFile)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('posts')
                        .getPublicUrl(filePath)

                    imageUrl = publicUrl
                }

                const moodString = selectedMood ? `${selectedMood.emoji} ${selectedMood.label}` : undefined
                
                await createSocialPost(content, imageUrl, videoUrl || undefined, moodString, isGlobal)
                
                // Clear state
                setContent('')
                setImageFile(null)
                setImagePreview(null)
                setVideoUrl('')
                setShowVideoInput(false)
                setSelectedMood(null)
                setShowMoods(false)
                setShowEmojiPicker(false)
                setIsExpanded(false)
                setIsGlobal(false)
            } catch (err) {
                console.error(err)
                alert('No se pudo publicar el post')
            }
        })
    }

    return (
        <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${isGlobal ? 'border-violet-200 bg-violet-50/30' : 'border-slate-100 bg-white'} p-6 shadow-xl shadow-slate-200/50`}>
            {isGlobal && (
                <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-violet-600 text-white rounded-full w-fit animate-pulse shadow-lg shadow-violet-200">
                    <Globe className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[8px] md:text-[10px]">Post Global • Todas las AMPAs</span>
                </div>
            )}
            <div className="flex gap-4">
                <div className={`h-12 w-12 shrink-0 rounded-2xl ${isGlobal ? 'bg-violet-100 text-violet-700' : 'bg-brand/20 text-brand'} flex items-center justify-center font-bold border-2 border-white shadow-sm overflow-hidden`}>
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
                    ) : (
                        userName[0]
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        {selectedMood && (
                            <div className="flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-black w-fit animate-in fade-in slide-in-from-left-2">
                                <span>{selectedMood.emoji} {selectedMood.label}</span>
                                <button onClick={() => setSelectedMood(null)}><X className="w-3 h-3" /></button>
                            </div>
                        )}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            placeholder={isGlobal ? "¿Qué anuncio global quieres hacer?" : `¿Qué tienes en mente, ${userName?.split(' ')?.[0] || 'Usuario'}?`}
                            rows={isExpanded ? 3 : 1}
                            className="w-full resize-none border-none bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 text-lg font-medium leading-relaxed"
                        />
                    </div>

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

                    {showVideoInput && (
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 animate-in zoom-in-95">
                            <LinkIcon className="w-4 h-4 text-slate-400" />
                            <input 
                                type="url" 
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="Pega el enlace de Youtube o Video"
                                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 flex-1 p-0"
                            />
                            <button onClick={() => { setShowVideoInput(false); setVideoUrl(''); }} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {showMoods && (
                        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-in slide-in-from-top-2">
                            {MOODS.map((mood) => (
                                <button
                                    key={mood.label}
                                    onClick={() => { setSelectedMood(mood); setShowMoods(false); }}
                                    className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-bold hover:border-brand hover:text-brand transition-all flex items-center gap-2"
                                >
                                    <span>{mood.emoji}</span>
                                    <span>{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {showEmojiPicker && (
                         <div className="p-4 grid grid-cols-5 md:grid-cols-8 gap-2 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-in slide-in-from-top-2 shadow-inner">
                            {POPULAR_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => addEmoji(emoji)}
                                    type="button"
                                    className="text-2xl hover:scale-125 transition-transform duration-75 p-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center aspect-square"
                                >
                                    {emoji}
                                </button>
                            ))}
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
                            <div className="flex flex-wrap items-center gap-1 md:gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-50 transition-all group"
                                >
                                    <ImageIcon className="h-5 w-5 text-emerald-500 transition-transform group-hover:scale-110" />
                                    <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Foto</span>
                                </button>
                                <button 
                                    onClick={() => setShowVideoInput(!showVideoInput)}
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all group ${showVideoInput ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Video className="h-5 w-5 text-brand transition-transform group-hover:scale-110" />
                                    <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Video</span>
                                </button>
                                <button 
                                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowMoods(false); }}
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all group ${showEmojiPicker ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Smile className="h-5 w-5 text-amber-500 transition-transform group-hover:scale-110" />
                                    <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Emojis</span>
                                </button>
                                <button 
                                    onClick={() => { setShowMoods(!showMoods); setShowEmojiPicker(false); }}
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all group ${showMoods ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Sparkles className="h-5 w-5 text-brand/80 transition-transform group-hover:scale-110" />
                                    <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Estado</span>
                                </button>
                                
                                {isSuperadmin && (
                                    <button 
                                        onClick={() => setIsGlobal(!isGlobal)}
                                        className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all group ${isGlobal ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Globe className={`h-5 w-5 transition-transform group-hover:scale-110 ${isGlobal ? 'text-white' : 'text-violet-500'}`} />
                                        <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Global</span>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handlePost}
                                disabled={(!content.trim() && !imageFile && !videoUrl) || isPending}
                                className={`flex items-center gap-3 rounded-2xl px-8 py-4 text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${isGlobal ? 'bg-violet-600 shadow-violet-100 hover:bg-violet-700' : 'bg-brand shadow-brand/20 hover:opacity-90'}`}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        {isGlobal ? 'Difundir' : 'Publicar'} <Send className="h-3.5 w-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {!isExpanded && (
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors">
                        <ImageIcon className="h-4 w-4" /> Imagen
                    </button>
                    <button onClick={() => { setIsExpanded(true); setShowVideoInput(true); }} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors">
                        <Video className="h-4 w-4" /> Video
                    </button>
                    <button onClick={() => { setIsExpanded(true); setShowEmojiPicker(true); }} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors">
                        <Smile className="h-4 w-4 text-amber-400" /> Emojis
                    </button>
                    <button onClick={() => { setIsExpanded(true); setShowMoods(true); }} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors">
                        <Sparkles className="h-4 w-4 text-brand/80" /> Mi Estado
                    </button>
                </div>
            )}
        </div>
    )
}
