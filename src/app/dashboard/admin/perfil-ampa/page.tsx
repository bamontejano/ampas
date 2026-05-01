import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2, Save, Palette, Info, Camera } from 'lucide-react'
import { updateAmpaSettings } from '@/app/actions/admin'

export default async function PerfilAmpaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('ampa_id, rol')
        .eq('id', user.id)
        .single()

    if (!profile?.ampa_id) {
        redirect('/dashboard')
    }

    const { data: ampa } = await supabase
        .from('ampas')
        .select('*')
        .eq('id', profile.ampa_id)
        .single()

    if (!ampa) redirect('/dashboard')

    return (
        <div className="space-y-10 pb-16">
            <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Identidad del AMPA</h2>
                <p className="text-slate-500 font-medium mt-2">Personaliza cómo ven tu asociación las familias.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                        <form action={async (formData) => {
                            'use server'
                            await updateAmpaSettings(ampa.id, formData)
                        }} className="space-y-8">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-brand" /> Información General
                                    </h3>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Público del AMPA</label>
                                        <input 
                                            name="nombre" 
                                            defaultValue={ampa.nombre}
                                            required 
                                            className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Centro Escolar</label>
                                        <input 
                                            name="colegio_nombre" 
                                            defaultValue={ampa.colegio_nombre || ''}
                                            className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ciudad</label>
                                        <input 
                                            name="ciudad" 
                                            defaultValue={ampa.ciudad || ''}
                                            className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-brand" /> Estilo y Visual
                                    </h3>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Color de Marca</label>
                                        <div className="grid grid-cols-3 gap-3 mt-2">
                                            {[
                                                { id: 'indigo', label: 'Indigo', hex: '#4f46e5' },
                                                { id: 'rose', label: 'Rosa', hex: '#e11d48' },
                                                { id: 'emerald', label: 'Verde', hex: '#10b981' },
                                                { id: 'amber', label: 'Ámbar', hex: '#f59e0b' },
                                                { id: 'sky', label: 'Cielo', hex: '#0ea5e9' },
                                                { id: 'violet', label: 'Violeta', hex: '#8b5cf6' },
                                            ].map(color => (
                                                <label key={color.id} className="relative cursor-pointer">
                                                    <input type="radio" name="color_primario" value={color.id} defaultChecked={(ampa.color_primario || 'indigo') === color.id} className="peer sr-only" />
                                                    <div className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 peer-checked:border-slate-900 peer-checked:bg-white transition-all hover:bg-white">
                                                        <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: color.hex }} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{color.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">URL del Logo (Opcional)</label>
                                        <div className="relative">
                                            <input 
                                                name="logo_url" 
                                                defaultValue={ampa.logo_url || ''}
                                                placeholder="https://..."
                                                className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all"
                                            />
                                            <Camera className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción o Lema del AMPA</label>
                                <textarea 
                                    name="descripcion" 
                                    defaultValue={ampa.descripcion || ''}
                                    rows={4}
                                    placeholder="Escribe una breve presentación de vuestra asociación..."
                                    className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all min-h-[120px]"
                                />
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-50">
                                <button className="flex items-center gap-2 bg-slate-900 text-white rounded-[1.5rem] px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-brand transition-all shadow-xl shadow-slate-200 active:scale-95">
                                    <Save className="w-5 h-5" /> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-brand rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        <h3 className="text-xl font-black mb-4 relative z-10">Vista Previa</h3>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                                    {ampa.logo_url ? (
                                        <img src={ampa.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-brand" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-sm truncate">{ampa.nombre}</h4>
                                    <p className="text-[10px] opacity-60 font-medium truncate">{ampa.colegio_nombre}</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/30 rounded-full mb-4" />
                            <p className="text-[10px] opacity-80 leading-relaxed line-clamp-3 italic">
                                "{ampa.descripcion || 'Sin descripción configurada aún.'}"
                            </p>
                        </div>
                        {/* Deco */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex gap-4 shadow-sm">
                        <Info className="w-5 h-5 text-amber-600 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Consejo</h4>
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                Sube el logo a una plataforma como Cloudinary o usa la URL de tu web actual para que aparezca en la cabecera de todas las familias.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
