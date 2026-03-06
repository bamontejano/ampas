import { createClient } from '@/lib/supabase/server'
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Clock,
    Briefcase,
    Lightbulb,
    AlertCircle,
    Users,
    Gamepad2,
    Calendar,
    Sparkles,
    Shield
} from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database'
import RealtimeFeed from '@/components/dashboard/realtime-feed'
import SocialPostCompose from '@/components/dashboard/social-post-compose'

type ProfileWithAmpa = Database['public']['Tables']['profiles']['Row'] & {
    ampas: Database['public']['Tables']['ampas']['Row'] | null
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('*, ampas(*)')
        .eq('id', user?.id as string)
        .maybeSingle()

    const profile = profileRaw as unknown as ProfileWithAmpa
    const rol = profile?.rol || 'familia'
    const isSuperadmin = rol === 'superadmin'

    // Fetch real posts from Supabase (Only if has ampa_id or is superadmin)
    let posts: any[] = []
    let likedPostIds: string[] = []

    if (profile?.ampa_id || isSuperadmin) {
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

        // Filter by ampa_id if not superadmin
        if (!isSuperadmin) {
            query.eq('ampa_id', profile?.ampa_id as string)
        }

        const { data: postsRaw } = await query
        posts = postsRaw || []

        const { data: userLikes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('perfil_id', user?.id as string)

        likedPostIds = (userLikes || []).map(like => (like as any).post_id)
    }

    const apps = [
        { name: 'Gestión de Límites', desc: 'Control y acuerdos con adolescentes.', icon: AlertCircle, color: 'bg-indigo-500', href: '/dashboard/comunidad/foros/adolescencia-limites' },
        { name: 'Educación Emocional', desc: 'Gestión de emociones y autoestima.', icon: Lightbulb, color: 'bg-emerald-500', href: '/dashboard/comunidad/foros/educacion-emocional' }
    ]

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-16">
            {/* Welcome Hero */}
            <section className={`relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl ${isSuperadmin
                ? 'bg-gradient-to-br from-violet-600 to-indigo-900 shadow-violet-200'
                : 'bg-indigo-600 shadow-indigo-200'
                }`}>
                <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                        {isSuperadmin ? 'Plataforma Global' : (profile?.ampas?.nombre || 'Miembro')}
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-white">¡Hola, {profile?.nombre_completo?.split(' ')?.[0] || 'Usuario'}! 👋</h2>
                    <p className="max-w-md text-indigo-100 font-medium leading-relaxed">
                        {isSuperadmin
                            ? 'Tienes acceso total a la configuración de la plataforma y gestión de todas las AMPAs.'
                            : `Bienvenido al espacio comunitario de ${profile?.ampas?.nombre || 'tu AMPA'}. Aquí tienes los recursos psicoeducativos del día.`
                        }
                    </p>

                    {isSuperadmin && (
                        <div className="flex gap-3 pt-2">
                            <Link href="/dashboard/superadmin/ampas" className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all">
                                Gestionar AMPAs
                            </Link>
                        </div>
                    )}
                </div>
                <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"></div>
                <div className="absolute right-12 top-10 hidden lg:block opacity-10">
                    {isSuperadmin ? <Shield className="w-40 h-40" /> : <Lightbulb className="w-32 h-32" />}
                </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-8">
                    {profile?.ampa_id && (
                        <SocialPostCompose
                            userName={profile?.nombre_completo || 'Usuario'}
                            userAvatar={profile?.avatar_url}
                        />
                    )}

                    <div className="flex items-center justify-between pt-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-amber-500" />
                            {isSuperadmin ? 'Actividad de la Plataforma' : 'Muro de la Comunidad'}
                        </h3>
                        {!isSuperadmin && (
                            <Link href="/dashboard/comunidad" className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                                Explorar Foros
                            </Link>
                        )}
                    </div>

                    {profile?.ampa_id || isSuperadmin ? (
                        <RealtimeFeed
                            initialPosts={posts}
                            ampaId={profile?.ampa_id || 'global'}
                            initialLikedPosts={likedPostIds}
                        />
                    ) : (
                        <div className="p-12 text-center rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Asigna una AMPA a tu perfil para ver el muro</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Quick Access Apps */}
                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40">
                        <h3 className="mb-6 font-black text-slate-900 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                            <Gamepad2 className="h-4 w-4 text-indigo-500" />
                            Servicios
                        </h3>
                        <div className="space-y-4">
                            {apps.map((app) => (
                                <Link key={app.name} href={app.href} className="flex items-center gap-4 rounded-2xl p-3 transition-all hover:bg-slate-50 group border border-transparent hover:border-slate-100">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${app.color} text-white shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform`}>
                                        <app.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">{app.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{app.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Proximos Eventos Shortcut */}
                    <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="mb-6 font-black flex items-center gap-2 uppercase text-[10px] tracking-widest text-white/50">
                                <Calendar className="h-4 w-4 text-emerald-400" />
                                Próximos Eventos
                            </h3>
                            <div className="space-y-6">
                                <div className="group cursor-pointer">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Este Viernes</p>
                                    <h4 className="text-sm font-bold group-hover:text-indigo-300 transition-colors">Taller de Crianza Consciente</h4>
                                    <p className="text-xs text-white/40 mt-1">17:30 · Salón de Actos</p>
                                </div>
                                <Link href="/dashboard/eventos" className="block w-full text-center py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest">
                                    Ver Calendario
                                </Link>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Featured Resource */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="relative z-10">
                            <span className="mb-4 inline-block rounded-lg bg-rose-50 px-3 py-1 text-[10px] font-black uppercase text-rose-600 tracking-widest">Destacado</span>
                            <h4 className="text-lg font-black text-slate-900 leading-tight">Guía: "Límites sin Conflictos"</h4>
                            <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">20 estrategias prácticas para mejorar la convivencia en casa.</p>
                            <button className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-4 text-xs font-black text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                                Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

