import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Ticket, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { redeemInvitation } from '@/app/actions/onboarding'

export default async function FixAccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, ampas(*)')
        .eq('id', user.id)
        .maybeSingle()

    const ampa = profile?.ampas

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Estado de tu Cuenta</h1>
                <p className="text-slate-500 font-medium">Panel de diagnóstico y vinculación forzada.</p>
            </div>

            <div className="grid gap-6">
                {/* Status Cards */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Perfil en BD</p>
                                <p className="font-bold text-slate-900">{profile ? 'Encontrado' : 'No existe'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tu ID</p>
                            <p className="font-mono text-[10px] text-slate-500">{user.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ampa ? 'bg-brand/20 text-brand' : 'bg-slate-100 text-slate-400'}`}>
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Rol Actual</p>
                            <p className="text-xl font-black text-slate-900 uppercase">
                                {profile?.rol === 'admin' ? 'Administrador' : profile?.rol === 'admin' ? 'admin' : 'Miembro / Familia'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ampa ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-400'}`}>
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">AMPA Vinculada</p>
                            <p className="text-xl font-black text-slate-900">
                                {ampa?.nombre || 'Ninguna (Sin vincular)'}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">{profile?.ampa_id || 'ID de ampa vacío'}</p>
                        </div>
                    </div>
                </div>

                {/* Fix Form */}
                {(!ampa || profile?.rol !== 'admin') && (
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 shadow-2xl shadow-brand/10">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-amber-400" />
                            <h2 className="text-xl font-black">Vincular Código de Administrador</h2>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Si eres el administrador pero te aparece "Miembro", introduce aquí tu código ADMIN-XXXXXX para forzar la vinculación correcta.</p>
                        <form action={redeemInvitation} className="flex gap-2">
                            <input 
                                name="codigo"
                                type="text"
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:bg-white/20 focus:outline-none"
                                placeholder="ADMIN-XXXXXX"
                                required
                            />
                            <button className="bg-white text-slate-900 rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all">
                                Forzar Vinculación
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="text-center">
                <a href="/dashboard" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors"> Volver al Dashboard</a>
            </div>
        </div>
    )
}
