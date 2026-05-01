import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Send, Bell, Users, Clock, AlertCircle, Sparkles } from 'lucide-react'
import { enviarComunicado } from '@/app/actions/admin'

export default async function MensajeriaAdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (!profile?.ampa_id || !['admin', 'admin'].includes(profile.rol || '')) {
        redirect('/dashboard')
    }

    // Get count of members
    const { count: totalSocios } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('ampa_id', profile.ampa_id)

    // Get historical messages
    const { data: historial } = await supabase
        .from('comunicados')
        .select('*, profiles(nombre_completo)')
        .eq('ampa_id', profile.ampa_id)
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="space-y-10 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Comunicados Masivos</h2>
                    <p className="text-slate-500 font-medium mt-2">Envía notificaciones instantáneas a todos los socios de tu AMPA.</p>
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm">
                    <Users className="w-5 h-5 text-brand" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Alcance Total</p>
                        <p className="text-sm font-black text-slate-900 leading-none mt-1">{totalSocios || 0} Familias</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                        <form action={async (formData) => {
                            'use server'
                            await enviarComunicado(formData)
                        }} className="space-y-6">
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título del Mensaje</label>
                                <input 
                                    name="titulo" 
                                    required 
                                    placeholder="Ej: Recordatorio: Asamblea General el martes"
                                    className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Notificación</label>
                                    <select name="tipo" className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:outline-none font-bold">
                                        <option value="sistema">Aviso General</option>
                                        <option value="evento">Evento / Actividad</option>
                                        <option value="votacion">Urgente / Votación</option>
                                        <option value="comunidad">Comunidad</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enlace opcional (URL)</label>
                                    <input 
                                        name="enlace" 
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mensaje para las familias</label>
                                <textarea 
                                    name="contenido" 
                                    required
                                    rows={6}
                                    placeholder="Escribe aquí el contenido detallado del comunicado..."
                                    className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all min-h-[160px]"
                                />
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-50">
                                <button className="flex items-center gap-3 bg-slate-900 text-white rounded-[1.5rem] px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-brand transition-all shadow-xl shadow-slate-200 active:scale-95">
                                    <Send className="w-5 h-5" /> Enviar Comunicado
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-brand rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black leading-tight">Envío Directo y Masivo</h3>
                            <p className="text-white/80 text-sm font-medium leading-relaxed">
                                Este mensaje llegará como una notificación instantánea a todas las familias vinculadas. 
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/20">
                                <Clock className="w-3 h-3" /> Tiempo de entrega: Inmediato
                            </div>
                        </div>
                        {/* Deco */}
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex gap-4 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Atención</h4>
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                Los comunicados masivos no pueden borrarse una vez enviados. Por favor, revisa bien el texto antes de pulsar enviar.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos Envíos</h4>
                        </div>
                        <div className="space-y-6">
                            {historial && historial.length > 0 ? (
                                historial.map((msg: any) => (
                                    <div key={msg.id} className="relative pl-6 border-l-2 border-slate-50 pb-2">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-100"></div>
                                        <p className="text-xs font-black text-slate-900 truncate mb-1">{msg.titulo}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {new Date(msg.created_at).toLocaleDateString()} · Alcance: {msg.alcance}
                                        </p>
                                        <p className="text-[9px] text-brand font-medium mt-1">Por: {msg.profiles?.nombre_completo}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-30">
                                    <Bell className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sin historial</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
