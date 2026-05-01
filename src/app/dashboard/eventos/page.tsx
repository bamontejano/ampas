import { createClient } from '@/lib/supabase/server'
import {
    CalendarDays,
    MapPin,
    Clock,
    Video,
    Users,
    ChevronRight,
    Plus,
    Calendar,
    Search
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import RegisterButton from '@/components/dashboard/register-button'

import Link from 'next/link'

export default async function EventosPage() {
    const supabase = await createClient()

    // Get current user profile for ampa_id
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user?.id as string)
        .single()

    const profile = profileRaw as any

    // Fetch events
    const { data: eventosRaw } = await supabase
        .from('eventos')
        .select(`
            *,
            asistencias_eventos (count)
        `)
        .eq('ampa_id', profile?.ampa_id as string)
        .order('fecha_inicio', { ascending: true })

    // Fetch user's registrations
    const { data: misAsistencias } = await supabase
        .from('asistencias_eventos')
        .select('evento_id')
        .eq('perfil_id', user?.id as string)

    const eventos = eventosRaw as any[]
    const misEventosIds = new Set((misAsistencias as any[])?.map(a => a.evento_id))

    // Stats calculation
    const proximoEvento = eventos?.[0]
    const totalEventos = eventos?.length || 0
    
    // Sum counts from asistencias_eventos query
    const totalInscripciones = eventos?.reduce((acc, curr) => {
        return acc + (curr.asistencias_eventos?.[0]?.count || 0)
    }, 0) || 0

    return (
        <div className="space-y-12 pb-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-2xl">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Calendario de Eventos</h2>
                    <p className="mt-4 text-slate-500 text-xl leading-relaxed">
                        Charlas, talleres y reuniones. Conecta con otros padres y expertos.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {(profile?.rol === 'admin' || profile?.rol === 'admin') && (
                        <Link
                            href="/dashboard/eventos/nuevo"
                            className="flex items-center gap-2 rounded-[1.5rem] bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95"
                        >
                            <Plus className="h-5 w-5" /> Nuevo Evento
                        </Link>
                    )}
                </div>
            </div>

            {/* Dynamic Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Eventos próximos', value: totalEventos, icon: Calendar, color: 'text-brand', bg: 'bg-brand/10' },
                    { label: 'Inscripciones totales', value: totalInscripciones, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Próxima cita', value: proximoEvento ? format(new Date(proximoEvento.fecha_inicio), 'd MMM', { locale: es }) : 'N/A', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {eventos && eventos.length > 0 ? (
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {eventos.map((evento) => (
                        <div key={evento.id} className="group relative flex flex-col rounded-[3rem] border border-slate-100 bg-white p-3 shadow-2xl shadow-slate-200/40 transition-all hover:-translate-y-2 hover:shadow-brand/10">
                            {/* Visual Header */}
                            <div className="relative h-56 w-full overflow-hidden rounded-[2.5rem]">
                                {evento.imagen_url ? (
                                    <img src={evento.imagen_url} alt={evento.titulo} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
                                        <Calendar className="h-20 w-20 text-brand/30" />
                                    </div>
                                )}

                                <div className="absolute top-6 left-6">
                                    <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xl px-4 py-2 text-[10px] font-black text-white border border-white/20 uppercase tracking-widest shadow-2xl">
                                        {evento.tipo === 'online' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                                        <span className="capitalize">{evento.tipo}</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-8 right-8 text-white">
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 block">
                                        {format(new Date(evento.fecha_inicio), 'EEEE, d MMMM', { locale: es })}
                                    </span>
                                    <h3 className="text-2xl font-black leading-tight drop-shadow-md">
                                        {evento.titulo}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col px-8 py-10">
                                <p className="mb-10 line-clamp-2 text-sm text-slate-500 leading-relaxed font-medium">
                                    {evento.descripcion || 'No se ha proporcionado una descripción detallada para este evento.'}
                                </p>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                                        <MapPin className="h-4 w-4 text-rose-500" />
                                        <span className="text-sm font-bold text-slate-700 truncate">{evento.lugar || 'Ubicación por confirmar'}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100 flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Asistentes</span>
                                            <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                                                <Users className="h-3.5 w-3.5 text-emerald-500" />
                                                {(evento.asistencias_eventos?.[0]?.count || 0)}
                                                {evento.max_asistentes && ` / ${evento.max_asistentes}`}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100 flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Horario</span>
                                            <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                                                <Clock className="h-3.5 w-3.5 text-brand" />
                                                {format(new Date(evento.fecha_inicio), 'HH:mm')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <RegisterButton
                                        eventoId={evento.id}
                                        isRegisteredInitial={misEventosIds.has(evento.id)}
                                    />

                                    {(profile?.rol === 'admin' || profile?.rol === 'admin') && (
                                        <Link
                                            href={`/dashboard/eventos/${evento.id}/asistencias`}
                                            className="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand transition-colors"
                                        >
                                            Ver lista de asistentes
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200 text-center px-10 shadow-sm">
                    <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center mb-10 shadow-inner">
                        <CalendarDays className="h-16 w-16 text-slate-300" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">El calendario está libre</h3>
                    <p className="text-slate-500 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
                        Estamos planificando las próximas actividades. Suscríbete a las notificaciones para ser el primero en enterarte.
                    </p>
                    {(profile?.rol === 'admin' || profile?.rol === 'admin') && (
                        <Link
                            href="/dashboard/eventos/nuevo"
                            className="flex items-center gap-3 rounded-2xl bg-brand px-10 py-5 text-sm font-black text-white transition-all hover:opacity-90 shadow-2xl" style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            <Plus className="h-6 w-6" /> Programar Actividad
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
