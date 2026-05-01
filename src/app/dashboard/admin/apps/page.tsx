import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, Trash2, ExternalLink, Gamepad2, Info } from 'lucide-react'
import { createAmpaApp, deleteAmpaApp } from '@/app/actions/admin'

export default async function AdminAppsPage() {
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

    const { data: apps } = await supabase
        .from('ampa_apps')
        .select('*')
        .eq('ampa_id', profile.ampa_id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestionar Apps</h2>
                    <p className="text-slate-500 font-medium">Configura enlaces externos y herramientas para tus familias.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario Nueva App */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm sticky top-8">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-brand" /> Añadir Nueva App
                        </h3>
                        
                        <form action={async (formData) => {
                                'use server'
                                await createAmpaApp(formData)
                            }} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre de la App</label>
                                <input 
                                    name="nombre" 
                                    required 
                                    placeholder="Ej: Google Classroom"
                                    className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción corta</label>
                                <textarea 
                                    name="descripcion" 
                                    placeholder="¿Para qué sirve esta app?"
                                    className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">URL de acceso o descarga</label>
                                <input 
                                    name="url_acceso" 
                                    type="url"
                                    required 
                                    placeholder="https://..."
                                    className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Icono (Lucide)</label>
                                    <select name="icono" className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:outline-none">
                                        <option value="Zap">Rayo</option>
                                        <option value="Globe">Web</option>
                                        <option value="Smartphone">Móvil</option>
                                        <option value="Book">Libro</option>
                                        <option value="Heart">Corazón</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Color</label>
                                    <select name="color" className="w-full mt-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:outline-none">
                                        <option value="bg-brand">Indigo</option>
                                        <option value="bg-rose-600">Rosa</option>
                                        <option value="bg-emerald-600">Verde</option>
                                        <option value="bg-blue-600">Azul</option>
                                        <option value="bg-amber-600">Ámbar</option>
                                    </select>
                                </div>
                            </div>
                            <button className="w-full mt-4 bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-brand transition-all shadow-lg active:scale-95">
                                Guardar Aplicación
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista de Apps Actuales */}
                <div className="lg:col-span-2 space-y-4">
                    {!apps || apps.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Gamepad2 className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="text-slate-900 font-black">No hay apps vinculadas</h4>
                            <p className="text-slate-500 text-sm mt-1">Usa el formulario de la izquierda para añadir la primera.</p>
                        </div>
                    ) : (
                        apps.map((app: any) => (
                            <div key={app.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-6 group hover:border-brand/10 transition-all shadow-sm">
                                <div className={`h-14 w-14 rounded-2xl ${app.color || 'bg-brand'} flex items-center justify-center text-white shadow-lg`}>
                                    <Gamepad2 className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-900 truncate">{app.nombre}</h4>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{app.url_acceso}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={app.url_acceso} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-brand hover:bg-brand/10 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <form action={async () => {
                                        'use server'
                                        await deleteAmpaApp(app.id)
                                    }}>
                                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}

                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
                        <Info className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            <strong>Consejo:</strong> Puedes usar enlaces profundos (Deep Links) si la app lo soporta para abrir directamente secciones específicas en el móvil del usuario.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
