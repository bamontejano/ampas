import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    Users,
    UserPlus,
    ShieldAlert,
    BarChart3,
    Settings,
    Mail,
    MoreVertical,
    CheckCircle2
} from 'lucide-react'
import { generateInviteCode } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import SubirRecursoForm from '@/components/dashboard/subir-recurso-form'
import type { Database } from '@/types/database'

// Definimos el tipo del perfil que esperamos de la consulta
type ProfileWithAmpa = Database['public']['Tables']['profiles']['Row'] & {
    ampas: Database['public']['Tables']['ampas']['Row'] | null
}

import { SupabaseClient } from '@supabase/supabase-js'

async function createInvite(ampaId: string, profileId: string) {
    'use server'
    const supabase: any = await createClient()
    const codigo = generateInviteCode()

    const { error } = await supabase
        .from('invitaciones')
        .insert({
            ampa_id: ampaId,
            codigo,
            creado_por: profileId
        })

    if (!error) revalidatePath('/dashboard/admin')
}

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('*, ampas(*)')
        .eq('id', user.id)
        .single()

    const profile = profileRaw as unknown as ProfileWithAmpa

    // Solo administradores pueden ver esto
    if (profile?.rol === 'user') {
        redirect('/dashboard')
    }

    // Obtenemos invitaciones
    const { data: invitacionesRaw } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('ampa_id', profile.ampa_id!)
        .order('created_at', { ascending: false })
        .limit(5)

    const invitaciones = invitacionesRaw as any[]

    // Obtenemos miembros
    const { data: miembrosRaw, count: miembrosCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('ampa_id', profile.ampa_id!)
        .limit(5)

    const miembros = miembrosRaw as any[]

    // Obtenemos códigos libres
    const { count: invitacionesLibres } = await supabase
        .from('invitaciones')
        .select('*', { count: 'exact', head: true })
        .eq('ampa_id', profile.ampa_id!)
        .eq('usado', false)

    return (
        <div className="space-y-8 pb-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Panel de Gestión</h2>
                    <p className="text-slate-500">Control de comunidad para {profile?.ampas?.nombre}</p>
                </div>
                <form action={createInvite.bind(null, profile?.ampa_id!, profile?.id!)}>
                    <button className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg shadow-brand/10">
                        <UserPlus className="h-4 w-4" /> Generar Código
                    </button>
                </form>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Familias Activas', value: miembrosCount?.toString() || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Recursos Vistos', value: '0', icon: BarChart3, color: 'text-brand', bg: 'bg-brand/10' },
                    { label: 'Códigos Libres', value: invitacionesLibres?.toString() || '0', icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Reportes', value: '0', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <h4 className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden text-slate-900">
                    <div className="border-b border-slate-100 p-6 flex justify-between items-center">
                        <h3 className="font-bold">Invitaciones Recientes</h3>
                        <button className="text-sm text-brand font-bold hover:underline">Ver todas</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {invitaciones?.map((inv) => (
                            <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="font-mono font-bold bg-brand/10 text-brand px-3 py-1 rounded-lg border border-brand/10">
                                        {inv.codigo}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Creado {new Date(inv.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {inv.usado ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                        <CheckCircle2 className="h-3 w-3" /> Usado
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-amber-600 uppercase">Pendiente</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden text-slate-900">
                        <div className="border-b border-slate-100 p-6 flex justify-between items-center">
                            <h3 className="font-bold">Últimos Miembros</h3>
                            <Settings className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                        </div>
                        <div className="divide-y divide-slate-50">
                            {miembros?.map((m) => (
                                <div key={m.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                            {m.nombre_completo?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold">{m.nombre_completo}</h5>
                                            <p className="text-xs text-slate-500">{m.rol}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-500"><MoreVertical className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SubirRecursoForm ampaId={profile.ampa_id!} />
                </div>
            </div>
        </div>
    )
}
