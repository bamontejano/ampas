'use client'

import { useState, useTransition, useEffect } from 'react'
import { Bell, Check, Clock, Calendar, Vote, Users, MessageSquare, ChevronRight } from 'lucide-react'
import { markAsRead, markAllAsRead } from '@/app/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Notification {
    id: string
    created_at: string
    titulo: string
    contenido: string
    leida: boolean
    tipo: 'evento' | 'votacion' | 'comunidad' | 'sistema'
    enlace: string | null
}

interface NotificationBellProps {
    initialNotifications: Notification[]
    perfilId: string
}

export default function NotificationBell({ initialNotifications, perfilId }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [notifications, setNotifications] = useState(initialNotifications)
    const supabase = createClient()

    const unreadCount = notifications.filter(n => !n.leida).length

    // Update state when props change
    useEffect(() => {
        setNotifications(initialNotifications)
    }, [initialNotifications])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel(`notificaciones:${perfilId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notificaciones',
                    filter: `perfil_id=eq.${perfilId}`
                },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 15))
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n))
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [perfilId, supabase])

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'evento': return <Calendar className="h-4 w-4 text-emerald-500" />
            case 'votacion': return <Vote className="h-4 w-4 text-brand" />
            case 'comunidad': return <Users className="h-4 w-4 text-amber-500" />
            default: return <Bell className="h-4 w-4 text-slate-400" />
        }
    }

    const handleMarkAsRead = async (id: string) => {
        startTransition(async () => {
            await markAsRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
        })
    }

    const handleMarkAllAsRead = async () => {
        startTransition(async () => {
            await markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
        })
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all ${isOpen ? 'bg-brand/10 text-brand' : 'text-slate-400 hover:text-brand hover:bg-slate-50'}`}
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-4 w-80 md:w-96 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] font-black text-brand uppercase tracking-widest hover:text-brand transition-colors"
                                >
                                    Marcar todas
                                </button>
                            )}
                        </div>

                        <div className="max-h-[28rem] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-5 hover:bg-slate-50/80 transition-colors relative group ${!n.leida ? 'bg-brand/10/30' : ''}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${!n.leida ? 'bg-white' : 'bg-slate-50'}`}>
                                                    {getIcon(n.tipo)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-slate-900 leading-tight pr-4">
                                                            {n.titulo}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                        {n.contenido}
                                                    </p>
                                                    {n.enlace && (
                                                        <Link
                                                            href={n.enlace}
                                                            onClick={() => {
                                                                setIsOpen(false)
                                                                if (!n.leida) handleMarkAsRead(n.id)
                                                            }}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black text-brand uppercase tracking-widest mt-2 hover:gap-2 transition-all"
                                                        >
                                                            Ver detalle <ChevronRight className="h-3 w-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            {!n.leida && (
                                                <button
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="absolute top-5 right-5 h-2 w-2 rounded-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Marcar como leída"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">Todo al día por aquí</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-4 bg-slate-50/50 border-t border-slate-50">
                                <Link
                                    href="/dashboard/notificaciones"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Ver todas las notificaciones
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
