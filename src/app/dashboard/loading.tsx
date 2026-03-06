import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="relative">
                <div className="h-24 w-24 rounded-3xl bg-white shadow-xl shadow-slate-200/60 flex items-center justify-center animate-pulse">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                </div>
                <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full -z-10 animate-pulse"></div>
            </div>
            <div className="mt-8 text-center space-y-2">
                <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-xs">Cargando Dashboard</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Preparando tu espacio comunitario...</p>
            </div>
        </div>
    )
}
