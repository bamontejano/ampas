import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    LayoutGrid,
    Building2,
    Users,
    Plus,
    CheckCircle2,
    XCircle,
    Globe,
    Zap,
    Star,
} from 'lucide-react'
import { createAmpa } from '@/app/actions/superadmin'
import { AmpaActions } from '@/components/dashboard/superadmin/ampa-actions'

const planConfig = {
    basico: { label: 'Básico', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Globe },
    estandar: { label: 'Estándar', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Zap },
    premium: { label: 'Premium', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Star },
}

export default async function SuperadminAmpasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if ((profile as any)?.rol !== 'superadmin') {
        redirect('/dashboard')
    }

    // All AMPAs with member count
    const { data: ampasRaw } = await supabase
        .from('ampas')
        .select('*, profiles(count)')
        .order('created_at', { ascending: false })

    const ampas = (ampasRaw as any[]) || []

    const totalActivas = ampas.filter(a => a.activo).length
    const totalInactivas = ampas.filter(a => !a.activo).length
    const totalMiembros = ampas.reduce((acc: number, a: any) => {
        return acc + (a.profiles?.[0]?.count ?? 0)
    }, 0)

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">

            {/* Hero */}
            <header className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-10 md:p-14 text-white shadow-2xl shadow-slate-400/20">
                <div className="relative z-10 max-w-2xl space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                        <LayoutGrid className="h-4 w-4 text-indigo-400" />
                        Superadministrador
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                        Gestión de <br />
                        <span className="text-indigo-400">AMPAs</span>
                    </h1>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed">
                        Administra todas las organizaciones registradas en la plataforma AMPA Connect.
                        Crea nuevas AMPAs, gestiona sus planes y controla su estado.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {[
                            { label: 'AMPAs registradas', value: ampas.length },
                            { label: 'Activas', value: totalActivas },
                            { label: 'Inactivas', value: totalInactivas },
                            { label: 'Miembros totales', value: totalMiembros },
                        ].map(s => (
                            <div key={s.label} className="bg-white/10 rounded-2xl px-5 py-3 backdrop-blur-md border border-white/10">
                                <p className="text-2xl font-black">{s.value}</p>
                                <p className="text-xs text-slate-400 font-semibold">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <Building2 className="absolute -right-10 -bottom-12 h-72 w-72 text-white/5 rotate-12" />
            </header>

            {/* Create new AMPA */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nueva AMPA</h2>
                            <p className="text-sm text-slate-400 font-medium">Registra una nueva organización en la plataforma</p>
                        </div>
                    </div>
                </div>

                <form action={createAmpa} className="p-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="lg:col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Nombre del AMPA *
                            </label>
                            <input
                                name="nombre"
                                required
                                placeholder="AMPA del Colegio ejemplo..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Nombre del Colegio
                            </label>
                            <input
                                name="colegio_nombre"
                                placeholder="Colegio San Ejemplo..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Ciudad
                            </label>
                            <input
                                name="ciudad"
                                placeholder="Madrid..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                                Plan
                            </label>
                            <select
                                name="plan"
                                defaultValue="basico"
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            >
                                <option value="basico">Básico</option>
                                <option value="estandar">Estándar</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="sm:mt-5 flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-black text-white uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-100"
                        >
                            <Plus className="h-4 w-4" />
                            Crear AMPA
                        </button>
                    </div>
                </form>
            </div>

            {/* AMPAs Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        Todas las AMPAs
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {ampas.length} organizaciones registradas en la plataforma
                    </p>
                </div>

                {ampas.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                                <Building2 className="h-10 w-10 opacity-20" />
                            </div>
                            <p className="font-bold text-lg">No hay AMPAs registradas</p>
                            <p className="text-sm font-medium">Usa el formulario de arriba para crear la primera.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70">
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">AMPA</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Colegio / Ciudad</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Plan</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Miembros</th>
                                    <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">Estado / Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ampas.map((ampa: any) => {
                                    const plan = planConfig[ampa.plan as keyof typeof planConfig] ?? planConfig.basico
                                    const PlanIcon = plan.icon
                                    const memberCount = ampa.profiles?.[0]?.count ?? 0

                                    return (
                                        <tr key={ampa.id} className="hover:bg-slate-50/40 transition-colors">
                                            {/* Name */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 border-white shadow-sm ${ampa.activo ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                                        {ampa.nombre?.[0]?.toUpperCase() || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${ampa.activo ? 'text-slate-900' : 'text-slate-400'}`}>
                                                            {ampa.nombre}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-mono">{ampa.slug}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Colegio / Ciudad */}
                                            <td className="px-8 py-5 hidden md:table-cell">
                                                <p className="text-sm font-medium text-slate-700">{ampa.colegio_nombre || '—'}</p>
                                                <p className="text-xs text-slate-400">{ampa.ciudad || '—'}</p>
                                            </td>

                                            {/* Plan */}
                                            <td className="px-8 py-5 hidden sm:table-cell">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-tight border ${plan.color}`}>
                                                    <PlanIcon className="h-3 w-3" />
                                                    {plan.label}
                                                </span>
                                            </td>

                                            {/* Members */}
                                            <td className="px-8 py-5 hidden lg:table-cell">
                                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                                    <Users className="h-4 w-4 text-slate-300" />
                                                    {memberCount}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-5">
                                                <AmpaActions ampaId={ampa.id} isActive={ampa.activo} />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
