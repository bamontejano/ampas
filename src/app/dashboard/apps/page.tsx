import { createClient } from '@/lib/supabase/server'
import {
    Gamepad2,
    ExternalLink,
    Zap,
    ShieldCheck,
    TrendingUp,
    ArrowRight,
    LayoutGrid
} from 'lucide-react'
import Link from 'next/link'

export default async function AppsIntegradasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    const { data: apps } = await supabase
        .from('ampa_apps')
        .select('*')
        .eq('ampa_id', profile?.ampa_id)
        .order('created_at', { ascending: false })

    const hasApps = apps && apps.length > 0
    const isOwner = ['admin', 'admin'].includes(profile?.rol || '')

    return (
        <div className="space-y-10 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-3xl">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight">
                        App Center
                    </h2>
                    <p className="mt-2 text-slate-500 text-lg font-medium">
                        Herramientas y accesos exclusivos gestionados por tu AMPA.
                    </p>
                </div>
                {isOwner && (
                    <Link 
                        href="/dashboard/admin/apps"
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 hover:border-brand/20 hover:text-brand transition-all shadow-sm"
                    >
                        <LayoutGrid className="w-4 h-4" /> Configurar Apps
                    </Link>
                )}
            </div>

            {!hasApps ? (
                <div className="rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center bg-white/50">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Gamepad2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">No hay apps vinculadas</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Tu AMPA aún no ha configurado herramientas externas. ¡Vuelve pronto!
                    </p>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                    {apps.map((app: any) => (
                        <div key={app.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white transition-all hover:shadow-2xl hover:shadow-brand/10/50 hover:-translate-y-1">
                            {/* Accent line */}
                            <div className={`h-2 ${app.color || 'bg-brand'}`}></div>

                            <div className="p-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${app.color || 'bg-brand'} text-white shadow-xl group-hover:scale-110 transition-transform`}>
                                        <Gamepad2 className="h-10 w-10" />
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100/50">
                                        <TrendingUp className="h-3 w-3" />
                                        Verificado por AMPA
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black text-slate-900 group-hover:text-brand transition-colors tracking-tight">
                                    {app.nombre}
                                </h3>
                                <p className="mt-4 text-slate-500 leading-relaxed font-medium">
                                    {app.descripcion}
                                </p>

                                <div className="mt-10 flex gap-4">
                                    <a 
                                        href={app.url_acceso}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 p-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-brand active:scale-95 shadow-lg shadow-slate-200"
                                    >
                                        <ExternalLink className="h-4 w-4" /> Lanzar Aplicación
                                    </a>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full ${app.color || 'bg-brand'} opacity-[0.03] blur-3xl`}></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Secure access info */}
            <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xl border border-white/20">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl font-black">Acceso Directo Seguro</h4>
                        <p className="text-indigo-200 mt-1 font-medium">
                            Estas herramientas son recomendadas por tu asociación. Algunos enlaces pueden requerir tus credenciales habituales.
                        </p>
                    </div>
                    <Link href="/dashboard/recursos" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-indigo-300 transition-colors">
                        Ver Guías <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                {/* Background glow */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-brand/20 blur-[120px] rounded-full"></div>
            </div>
        </div>
    )
}
