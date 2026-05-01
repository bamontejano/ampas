import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Ticket, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { redeemInvitation } from '@/app/actions/onboarding'

export default async function FixAccountPageRoot() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Usamos una consulta simple sin joins que puedan fallar por RLS recursivo
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    // Intentamos cargar la AMPA por separado
    let ampa = null
    if (profile?.ampa_id) {
        const { data: ampaData } = await supabase
            .from('ampas')
            .select('*')
            .eq('id', profile.ampa_id)
            .maybeSingle()
        ampa = ampaData
    }

    return (
        <div className="min-h-screen bg-slate-50 py-20">
            <div className="max-w-2xl mx-auto px-4 space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white mb-4">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Recuperación de Cuenta</h1>
                    <p className="text-slate-500 font-medium italic">"Si el dashboard no carga, es que algo en tus permisos está bloqueado."</p>
                </div>

                <div className="grid gap-6">
                    {/* Status Cards */}
                    <div className="bg-white rounded-[2rem] border-2 border-slate-200 p-8 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {profile ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Estado del Perfil</p>
                                    <p className="font-bold text-slate-900">{profile ? 'Perfil Encontrado' : 'Perfil NO EXISTE en la base de datos'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tu Rol</p>
                                <p className="font-black text-brand uppercase text-lg">
                                    {profile?.rol || 'SIN ROL'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">AMPA ID</p>
                                <p className="font-mono text-[10px] text-slate-500 truncate">
                                    {profile?.ampa_id || 'VACÍO'}
                                </p>
                                <p className="font-bold text-slate-900 text-xs mt-1">
                                    {ampa?.nombre || 'No vinculada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fix Form */}
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Ticket className="w-32 h-32 rotate-12" />
                        </div>
                        
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-400/20 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-amber-400" />
                                </div>
                                <h2 className="text-2xl font-black italic">VINCULACIÓN FORZADA</h2>
                            </div>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                Si el botón de abajo no te funciona, introduce aquí tu código <span className="text-white font-bold">ADMIN-XXXXXX</span>. 
                                Esta acción reescribirá tus permisos saltándose cualquier restricción previa.
                            </p>
                            
                            <form action={redeemInvitation} className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    name="codigo"
                                    type="text"
                                    className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all placeholder:text-white/20"
                                    placeholder="PEGA TU CÓDIGO AQUÍ"
                                    required
                                />
                                <button className="bg-white text-slate-900 rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all transform active:scale-95 whitespace-nowrap">
                                    ARREGLAR MI CUENTA
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <a href="/dashboard" className="group flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors">
                        <span>← Volver al Dashboard</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
