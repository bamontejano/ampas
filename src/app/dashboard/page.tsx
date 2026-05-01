import { createClient } from '@/lib/supabase/server'
import {
    Lightbulb,
    Shield,
    Sparkles,
    Calendar,
    Gamepad2,
    ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database'
import RealtimeFeed from '@/components/dashboard/realtime-feed'
import SocialPostCompose from '@/components/dashboard/social-post-compose'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id as string)
        .maybeSingle()

    const profile = profileRaw as any
    const rol = profile?.rol || 'user'
    const isAdmin = rol === 'admin'
    
    const ampaName = 'AMPA IES Cristo del Rosario'

    // Fetch real posts
    const query = supabase
        .from('posts')
        .select(`
            *,
            profiles:autor_id (
                nombre_completo,
                avatar_url,
                rol
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

    const { data: postsRaw } = await query
    const posts = postsRaw || []

    const { data: userLikes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('perfil_id', user?.id as string)

    const likedPostIds = (userLikes || []).map(like => (like as any).post_id)

    // Dynamic Apps/Services (ignoring ampa_id filter)
    const { data: ampaApps } = await supabase
        .from('ampa_apps')
        .select('*')
        .limit(3)

    // Upcoming Events (ignoring ampa_id filter)
    const { data: upcomingEvents } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha_inicio', new Date().toISOString())
        .order('fecha_inicio', { ascending: true })
        .limit(1)

    const nextEvent = upcomingEvents?.[0]

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-16">
            {/* Welcome Hero */}
            <section 
                className={`relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl bg-brand shadow-brand/20`}
                style={{ backgroundColor: 'var(--brand-primary, #4f46e5)' }}
            >
                <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                        {ampaName}
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-white">¡Hola, {profile?.nombre_completo?.split(' ')?.[0] || 'Usuario'}! 👋</h2>
                    <p className="max-w-md text-indigo-100 font-medium leading-relaxed">
                        Bienvenido al espacio comunitario del IES Cristo del Rosario.
                    </p>

                    {isAdmin && (
                        <div className="flex gap-3 pt-2">
                            <Link href="/dashboard/admin" className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all">
                                Panel de Gestión
                            </Link>
                        </div>
                    )}
                </div>
                <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"></div>
                <div className="absolute right-12 top-10 hidden lg:block opacity-10">
                    <Lightbulb className="w-32 h-32" />
                </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-8">
                    <SocialPostCompose
                        userName={profile?.nombre_completo || 'Usuario'}
                        userAvatar={profile?.avatar_url}
                        isSuperadmin={isAdmin}
                    />

                    <div className="flex items-center justify-between pt-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-amber-500" />
                            Muro de la Comunidad
                        </h3>
                        <Link href="/dashboard/comunidad" className="text-sm font-black text-brand hover:opacity-80 uppercase tracking-widest">
                            Explorar Foros
                        </Link>
                    </div>

                    <RealtimeFeed
                        initialPosts={posts}
                        ampaId={'global'}
                        initialLikedPosts={likedPostIds}
                    />
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Dynamic Apps Shortcut */}
                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40">
                        <h3 className="mb-6 font-black text-slate-900 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                            <Gamepad2 className="h-4 w-4 text-brand" />
                            Accesos Directos
                        </h3>
                        <div className="space-y-4">
                            {(!ampaApps || ampaApps.length === 0) ? (
                                <p className="text-[10px] text-slate-400 font-bold uppercase py-4">No hay accesos configurados</p>
                            ) : (
                                ampaApps.map((app) => (
                                    <a key={app.id} href={app.url_acceso} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl p-3 transition-all hover:bg-slate-50 group border border-transparent hover:border-slate-100">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${app.color || 'bg-brand'} text-white shadow-lg group-hover:scale-105 transition-transform`}>
                                            <Gamepad2 className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-black text-slate-900 truncate">{app.nombre}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{app.descripcion || 'Acceso externo'}</p>
                                        </div>
                                    </a>
                                ))
                            )}
                            <Link href="/dashboard/apps" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand transition-colors">
                                Ver todas las apps <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Proximos Eventos Dynamic */}
                    <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="mb-6 font-black flex items-center gap-2 uppercase text-[10px] tracking-widest text-white/50">
                                <Calendar className="h-4 w-4 text-emerald-400" />
                                Próximos Eventos
                            </h3>
                            <div className="space-y-6">
                                {nextEvent ? (
                                    <div className="group cursor-pointer">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                                            {format(new Date(nextEvent.fecha_inicio), "EEEE d 'de' MMMM", { locale: es })}
                                        </p>
                                        <h4 className="text-sm font-bold group-hover:text-indigo-300 transition-colors line-clamp-2">{nextEvent.titulo}</h4>
                                        <p className="text-xs text-white/40 mt-1">{format(new Date(nextEvent.fecha_inicio), 'HH:mm')} · {nextEvent.lugar}</p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-white/40 font-bold uppercase">No hay eventos próximos</p>
                                )}
                                <Link href="/dashboard/eventos" className="block w-full text-center py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest">
                                    Ver Calendario
                                </Link>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-brand/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Cleaned up Featured Card */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="relative z-10">
                            <span className="mb-4 inline-block rounded-lg bg-brand/10 px-3 py-1 text-[10px] font-black uppercase text-brand tracking-widest">Recursos</span>
                            <h4 className="text-lg font-black text-slate-900 leading-tight">Biblioteca Digital</h4>
                            <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">Accede a guías y materiales compartidos por tu comunidad.</p>
                            <Link href="/dashboard/recursos" className="mt-6 flex items-center justify-center w-full rounded-2xl bg-slate-900 px-4 py-4 text-xs font-black text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 uppercase tracking-widest">
                                Ver Recursos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
