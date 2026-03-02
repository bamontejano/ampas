import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    Users,
    Crown,
    ShieldCheck,
    Search,
    UserX,
    Mail,
    Calendar,
} from 'lucide-react'
import { UserRowActions, UserRoleBadge } from '@/components/dashboard/admin/user-row-actions'

type Role = 'familia' | 'junta' | 'admin_ampa' | 'superadmin'

const roleOrder: Record<Role, number> = {
    admin_ampa: 0,
    junta: 1,
    familia: 2,
    superadmin: -1,
}

export default async function AdminUsuariosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('*, ampas(*)')
        .eq('id', user.id)
        .single()

    const profile = profileRaw as any

    if (!['admin_ampa', 'superadmin'].includes(profile?.rol || '')) {
        redirect('/dashboard')
    }

    // Todos los miembros del mismo AMPA
    const { data: miembrosRaw } = await supabase
        .from('profiles')
        .select('*')
        .eq('ampa_id', profile.ampa_id)
        .order('created_at', { ascending: false })

    const miembros = (miembrosRaw as any[]) || []

    // Sort: admin > junta > familia
    miembros.sort((a, b) => (roleOrder[a.rol as Role] ?? 99) - (roleOrder[b.rol as Role] ?? 99))

    // Stats
    const totalFamilias = miembros.filter(m => m.rol === 'familia').length
    const totalJunta = miembros.filter(m => m.rol === 'junta').length
    const totalAdmins = miembros.filter(m => ['admin_ampa', 'superadmin'].includes(m.rol)).length
    const totalSocios = miembros.filter(m => m.estado_suscripcion === 'activo').length

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">

            {/* Hero */}
            <header className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-violet-700 via-indigo-600 to-blue-600 p-10 md:p-14 text-white shadow-2xl shadow-indigo-200">
                <div className="relative z-10 max-w-2xl space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                        <Users className="h-4 w-4" />
                        Panel de Administración
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                        Gestión de <br />
                        <span className="text-indigo-200">Miembros</span>
                    </h1>
                    <p className="text-lg text-indigo-100 font-medium leading-relaxed opacity-90">
                        Administra los roles y el acceso de todas las familias y miembros de la junta de{' '}
                        <strong>{profile?.ampas?.nombre}</strong>.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        {[
                            { label: 'Total miembros', value: miembros.length, icon: Users, bg: 'bg-white/20' },
                            { label: 'Socios Activos', value: totalSocios, icon: ShieldCheck, bg: 'bg-emerald-400/30' },
                            { label: 'Junta', value: totalJunta, icon: ShieldCheck, bg: 'bg-white/15' },
                            { label: 'Admins', value: totalAdmins, icon: Crown, bg: 'bg-white/15' },
                        ].map(s => (
                            <div key={s.label} className={`flex items-center gap-3 ${s.bg} rounded-2xl px-5 py-3 backdrop-blur-md`}>
                                <div className="text-center">
                                    <p className="text-2xl font-black">{s.value}</p>
                                    <p className="text-xs text-indigo-200 font-semibold">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative */}
                <Users className="absolute -right-10 -bottom-12 h-72 w-72 text-white/10 rotate-12" />
            </header>

            {/* Members Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Todos los Miembros
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                            {miembros.length} personas registradas en tu AMPA
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
                        <Search className="h-3.5 w-3.5" />
                        Puedes cambiar el rol y el estado de socio
                    </div>
                </div>

                {miembros.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                                <UserX className="h-10 w-10 opacity-20" />
                            </div>
                            <p className="font-bold text-lg">No hay miembros registrados</p>
                            <p className="text-sm font-medium text-slate-400">
                                Genera códigos de invitación para que las familias se unan.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70">
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Miembro
                                    </th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                                        Email
                                    </th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hidden md:table-cell text-center">
                                        Estado Socio
                                    </th>
                                    <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {miembros.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/40 transition-colors group">
                                        {/* Name + Avatar */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-sm ${m.rol === 'admin_ampa' || m.rol === 'superadmin'
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : m.rol === 'junta'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {m.avatar_url ? (
                                                        <img src={m.avatar_url} alt={m.nombre_completo} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        (m.nombre_completo?.[0] || m.email?.[0] || 'U').toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {m.nombre_completo || 'Sin nombre'}
                                                        {m.id === user.id && (
                                                            <span className="ml-2 text-[10px] text-slate-400 font-medium">(tú)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-medium sm:hidden">{m.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-8 py-5 hidden sm:table-cell">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                <Mail className="h-3.5 w-3.5 text-slate-300" />
                                                {m.email}
                                            </span>
                                        </td>

                                        {/* Subscription Status */}
                                        <td className="px-8 py-5 hidden md:table-cell text-center">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.estado_suscripcion === 'activo'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                }`}>
                                                {m.estado_suscripcion === 'activo' ? 'Activo' : 'Pendiente'}
                                            </div>
                                        </td>

                                        {/* Actions (client) */}
                                        <td className="px-8 py-5">
                                            <UserRowActions
                                                memberId={m.id}
                                                currentRole={m.rol as any}
                                                currentUserId={user.id}
                                                currentSubscription={m.estado_suscripcion || 'pendiente'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    {
                        icon: Crown,
                        title: 'Admin AMPA',
                        desc: 'Puede gestionar miembros, roles, invitaciones y configuración del AMPA.',
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50',
                        border: 'border-indigo-100',
                    },
                    {
                        icon: ShieldCheck,
                        title: 'Junta',
                        desc: 'Puede crear eventos, votaciones y comunicados. No puede gestionar roles.',
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                        border: 'border-blue-100',
                    },
                    {
                        icon: Users,
                        title: 'Familia',
                        desc: 'Acceso estándar a la comunidad, recursos y eventos. No puede administrar.',
                        color: 'text-slate-600',
                        bg: 'bg-slate-50',
                        border: 'border-slate-200',
                    },
                ].map(item => (
                    <div key={item.title} className={`p-6 bg-white rounded-[2rem] border ${item.border} shadow-sm flex items-start gap-4`}>
                        <div className={`h-12 w-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
