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
    ArrowRight
} from 'lucide-react'
import { createInvitations, deleteInvitation } from '@/app/actions/admin'
import { revalidatePath } from 'next/cache'

export default async function AdminInvitacionesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, ampas(*)')
        .eq('id', user.id)
        .single()

    if (!['admin', 'admin', 'admin'].includes(profile?.rol || '')) {
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
            <header className="relative overflow-hidden rounded-[3rem] bg-brand p-10 md:p-16 text-white shadow-2xl shadow-brand/20" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                        <Ticket className="h-4 w-4" />
                        Panel de Control
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                        Gestión de Acceso <br />
                        <span className="text-white/70">Códigos de Invitación</span>
                    </h1>
                    <p className="text-lg text-white/80 font-medium leading-relaxed opacity-90">
                        Genera códigos únicos para que las familias del {profile.ampas.colegio_nombre} puedan unirse a la plataforma de forma segura.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <form action={async () => {
                            'use server'
                            await createInvitations(1)
                        }}>
                            <button className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-brand uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl">
                                <Plus className="h-5 w-5" />
                                Generar 1 Código
                            </button>
                        </form>
                        <form action={async () => {
                            'use server'
                            await createInvitations(5)
                        }}>
                            <button className="flex items-center gap-2 rounded-2xl bg-white/20 px-6 py-4 text-sm font-black text-white uppercase tracking-widest hover:bg-white/30 transition-all active:scale-95 border border-white/20 backdrop-blur-sm">
                                <Plus className="h-5 w-5" />
                                Generar 5 Códigos
                            </button>
                        </form>
                    </div>
                </div>

                {/* Decorative Icon */}
                <UserPlus className="absolute -right-10 -bottom-10 h-80 w-80 text-white/10 rotate-12" />
            </header>

            {/* List Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Códigos Activos</h2>
                        <p className="text-sm text-slate-500 font-medium">Lista de invitaciones generadas por tu equipo.</p>
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
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Fecha</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Uso</th>
                                <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-slate-400">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invitaciones?.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-lg font-black text-brand tracking-widest bg-brand/10 px-3 py-1 rounded-lg">
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
                                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                                        {new Date(inv.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-700">
                                        {inv.usado ? (inv as any).profiles?.nombre_completo : '---'}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {!inv.usado && (
                                            <form action={async () => {
                                                'use server'
                                                await deleteInvitation(inv.id)
                                            }}>
                                                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {invitaciones?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-400">
                                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Ticket className="h-10 w-10 opacity-20" />
                                            </div>
                                            <p className="font-bold text-lg">No hay códigos generados</p>
                                            <p className="text-sm max-w-sm font-medium">Utiliza los botones de arriba para crear tus primeras invitaciones.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <ArrowRight className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Cómo funciona</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Copia un código disponible y envíalo a las familias por email o WhatsApp. Al registrarse, quedarán vinculados automáticamente a tu AMPA.
                        </p>
                    </div>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Ticket className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Seguridad</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Cada código es de un solo uso. Una vez utilizado, aparecerá el nombre de la persona que lo usó y no podrá ser compartido de nuevo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
