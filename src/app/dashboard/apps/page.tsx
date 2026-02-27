import { createClient } from '@/lib/supabase/server'
import {
    Gamepad2,
    ExternalLink,
    Zap,
    ShieldCheck,
    TrendingUp,
    Clock,
    ArrowRight
} from 'lucide-react'

export default async function AppsIntegradasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const apps = [
        {
            id: 'limites',
            nombre: 'Gestión de Límites',
            desc: 'Herramienta interactiva para negociar acuerdos y límites con adolescentes de forma positiva.',
            url: 'https://tu-app-limites.vercel.app', // placeholder
            icon: ShieldCheck,
            color: 'bg-indigo-600',
            stats: '85% Efectividad reportada',
            features: ['Contratos de conducta', 'Gestión de recompensas', 'Resolución de conflictos']
        },
        {
            id: 'estudio',
            nombre: 'Organizador de Estudio',
            desc: 'Optimización de rutinas, seguimiento de tareas y técnicas de estudio para cada etapa.',
            url: 'https://tu-app-estudio.vercel.app', // placeholder
            icon: Clock,
            color: 'bg-blue-600',
            stats: 'Mejora media de 2 pts en hábitos',
            features: ['Planificador semanal', 'Técnica Pomodoro', 'Seguimiento de exámenes']
        }
    ]

    return (
        <div className="space-y-10 pb-16">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Herramientas Exclusivas
                </h2>
                <p className="mt-2 text-slate-500 text-lg">
                    Tu suscripción a la AMPA incluye acceso premium a estas herramientas de apoyo familiar.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {apps.map((app) => (
                    <div key={app.id} className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all hover:shadow-2xl hover:shadow-indigo-100">
                        {/* Header de la App */}
                        <div className={`h-2 shadow-sm ${app.color}`}></div>

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${app.color} text-white shadow-lg`}>
                                    <app.icon className="h-8 w-8" />
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                                    <TrendingUp className="h-3 w-3" />
                                    {app.stats}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {app.nombre}
                            </h3>
                            <p className="mt-2 text-slate-500 leading-relaxed">
                                {app.desc}
                            </p>

                            <div className="mt-8 space-y-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Funcionalidades Core</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {app.features.map(feature => (
                                        <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                                            <Zap className="h-4 w-4 text-indigo-500" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95">
                                    <ExternalLink className="h-4 w-4" /> Lanzar Aplicación
                                </button>
                            </div>
                        </div>

                        {/* Soft background glow */}
                        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${app.color} opacity-[0.03] blur-3xl transition-opacity group-hover:opacity-[0.05]`}></div>
                    </div>
                ))}
            </div>

            {/* Info de SSO */}
            <div className="rounded-3xl bg-indigo-50 p-8 border border-indigo-100">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <ShieldCheck className="h-7 w-7" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-bold text-indigo-900">Acceso Sincronizado (SSO)</h4>
                        <p className="text-sm text-indigo-700 mt-1">
                            No necesitas crear cuentas nuevas. Al pulsar en "Lanzar", entrarás automáticamente con tu sesión de la AMPA.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
                        Saber más <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
