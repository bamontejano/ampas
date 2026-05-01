import { createClient } from '@/lib/supabase/server'
import {
    Users,
    ChevronLeft,
    Calendar,
    Mail,
    User,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { redirect } from 'next/navigation'

export default async function EventAttendeesPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params

    // 1. Verify user role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('rol, ampa_id')
        .eq('id', user?.id as string)
        .single()

    if (!profile || (profile.rol !== 'admin' && profile.rol !== 'admin')) {
        redirect('/dashboard/eventos')
    }

    // 2. Fetch event details
    const { data: evento } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single()

    if (!evento) redirect('/dashboard/eventos')

    // 3. Fetch attendees with profile info
    const { data: asistencias } = await supabase
        .from('asistencias_eventos')
        .select(`
            perfil_id,
            profiles (
                nombre_completo,
                email,
                avatar_url,
                rol
            )
        `)
        .eq('evento_id', id)

    const attendees = asistencias?.map((a: any) => a.profiles) || []

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <Link
                href="/dashboard/eventos"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium group"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Volver al calendario
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Users className="h-3.5 w-3.5" /> Control de Asistencia
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                        {evento.titulo}
                    </h1>
                    <div className="flex items-center gap-4 mt-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(evento.fecha_inicio), "d 'de' MMMM", { locale: es })}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <div>{attendees.length} personas inscritas</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Padre / Madre</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {attendees.length > 0 ? (
                                attendees.map((attendee: any, idx: number) => (
                                    <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                {attendee.avatar_url ? (
                                                    <img src={attendee.avatar_url} alt="" className="h-10 w-10 rounded-2xl object-cover shadow-sm" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div className="font-bold text-slate-900">{attendee.nombre_completo}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                <Mail className="h-3.5 w-3.5 text-slate-300" />
                                                {attendee.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${attendee.rol === 'admin' || attendee.rol === 'admin'
                                                    ? 'bg-amber-50 text-amber-600'
                                                    : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {attendee.rol}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Users className="h-12 w-12 mb-4 opacity-20" />
                                            <p className="font-bold">Nadie se ha inscrito todavía</p>
                                            <p className="text-sm">Las inscripciones aparecerán aquí automáticamente.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
