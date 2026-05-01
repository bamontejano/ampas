import { createClient } from '@/lib/supabase/server'
import {
    Bell,
    Calendar,
    Vote,
    Users,
    Check,
    Trash2,
    ChevronRight,
    MessageSquare,
    Info
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { markAsRead, markAllAsRead } from '@/app/actions/notifications'
import MarkAllButton from '@/components/dashboard/mark-all-button'

export default async function NotificacionesPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch all notifications
    const { data: notifications } = await supabase
        .from('notificaciones' as any)
        .select('*')
        .eq('perfil_id', user.id)
        .order('created_at', { ascending: false })

    const unreadCount = notifications?.filter((n: any) => !n.leida).length || 0

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'evento': return <Calendar className="h-6 w-6 text-emerald-500" />
            case 'votacion': return <Vote className="h-6 w-6 text-brand" />
            case 'comunidad': return <Users className="h-6 w-6 text-amber-500" />
            default: return <Bell className="h-6 w-6 text-slate-400" />
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Centro de Avisos</h1>
                    <p className="mt-4 text-slate-500 text-xl leading-relaxed max-w-xl">
                        Mantente al día con todo lo que ocurre en tu comunidad escolar.
                    </p>
                </div>
                {unreadCount > 0 && <MarkAllButton />}
            </div>

            <div className="space-y-4">
                {notifications && notifications.length > 0 ? (
                    notifications.map((n: any) => (
                        <div
                            key={n.id}
                            className={`group relative bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-brand/10/50 flex flex-col md:flex-row gap-6 items-start md:items-center ${!n.leida ? 'border-l-4 border-l-indigo-500 bg-brand/10/10' : ''}`}
                        >
                            <div className={`h-16 w-16 shrink-0 rounded-[1.5rem] flex items-center justify-center shadow-sm ${!n.leida ? 'bg-white' : 'bg-slate-50'}`}>
                                {getIcon(n.tipo)}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black text-slate-900">{n.titulo}</h3>
                                    {!n.leida && (
                                        <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                                    )}
                                </div>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {n.contenido}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Info className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                {n.enlace && (
                                    <Link
                                        href={n.enlace}
                                        className="flex-1 md:flex-none text-center px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-brand transition-all active:scale-95"
                                    >
                                        Ir al contenido
                                    </Link>
                                )}
                                {!n.leida && (
                                    <form action={async () => {
                                        'use server'
                                        await markAsRead(n.id)
                                    }}>
                                        <button className="h-12 w-12 rounded-xl border border-brand/10 text-brand flex items-center justify-center hover:bg-brand/10 transition-colors">
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                            <Bell className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Sin avisos pendientes</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            Aquí aparecerán las notificaciones sobre eventos, votaciones y actividad en el foro.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
