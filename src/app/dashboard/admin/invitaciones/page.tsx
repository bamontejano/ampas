import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    Ticket,
    Plus,
    Trash2,
    UserPlus,
    CheckCircle2,
    Clock,
    Copy,
    ArrowRight,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react'
import { createInvitations, deleteInvitation } from '@/app/actions/admin'

export default async function AdminInvitacionesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, ampas(*)')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'admin') {
        redirect('/dashboard')
    }

    const { data: invitaciones } = await supabase
        .from('invitaciones')
        .select('*, profiles:usado_por(nombre_completo)')
        .eq('ampa_id', profile.ampa_id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Hero Admin */}
            <header className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-16 text-white shadow-2xl shadow-slate-200">
                <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                        <ShieldCheck className="h-4 w-4 text-brand" />
                        Panel de Administración
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                        Control de Acceso <br />
                        <span className="text-brand">Invitaciones v2</span>
                    </h1>
                    <p className="text-lg text-white/60 font-medium leading-relaxed">
                        Gestiona quién puede unirse a {profile.ampas.colegio_nombre}. Crea códigos para familias o para nuevos administradores.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                        {/* Seccion Familias */}
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Invitaciones Familias</span>
                            </div>
                            <div className="flex gap-3">
                                <form action={createInvitations.bind(null, 1, 'user')}>
                                    <button className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-xs font-black text-slate-900 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
                                        <Plus className="h-4 w-4" /> 1 Código
                                    </button>
                                </form>
                                <form action={createInvitations.bind(null, 5, 'user')}>
                                    <button className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3.5 text-xs font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 border border-white/10">
                                        <Plus className="h-4 w-4" /> 5 Códigos
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Seccion Admin */}
                        <div className="bg-brand/10 rounded-3xl p-6 border border-brand/20 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-brand"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand">Acceso Administrativo</span>
                            </div>
                            <form action={createInvitations.bind(null, 1, 'admin')}>
                                <button className="w-full flex items-center justify-center gap-3 rounded-2xl bg-brand px-5 py-3.5 text-xs font-black text-white uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-brand/20">
                                    <UserPlus className="h-4 w-4" /> Generar Código Admin
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Decorative Icon */}
                <Ticket className="absolute -right-10 -bottom-10 h-80 w-80 text-white/5 rotate-12" />
            </header>

            {/* List Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Historial de Códigos</h2>
                        <p className="text-sm text-slate-500 font-medium">Gestiona y copia los códigos generados para tu comunidad.</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Ticket className="h-6 w-6" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Código</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Estado</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Destinatario</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Fecha</th>
                                <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invitaciones?.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono text-lg font-black tracking-widest px-3 py-1 rounded-lg ${
                                                inv.codigo.startsWith('ADMIN-') 
                                                ? 'bg-slate-900 text-white' 
                                                : 'bg-brand/10 text-brand'
                                            }`}>
                                                {inv.codigo}
                                            </span>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-brand transition-all">
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {inv.usado ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600 uppercase tracking-tighter border border-emerald-100">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Utilizado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600 uppercase tracking-tighter border border-amber-100">
                                                <Clock className="h-3.5 w-3.5" />
                                                Disponible
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        {inv.codigo.startsWith('ADMIN-') ? (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Administrador</span>
                                                <span className="text-[9px] text-slate-400 font-bold italic">{inv.usado ? (inv as any).profiles?.nombre_completo : 'Pendiente'}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Familia</span>
                                                <span className="text-[9px] text-slate-400 font-bold italic">{inv.usado ? (inv as any).profiles?.nombre_completo : 'Pendiente'}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                                        {new Date(inv.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {!inv.usado && (
                                            <form action={deleteInvitation.bind(null, inv.id)}>
                                                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90 ml-auto">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
