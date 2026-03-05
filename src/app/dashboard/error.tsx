'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error)
    }, [error])

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 rounded-[2.5rem] bg-rose-50 p-10 border border-rose-100 shadow-xl shadow-rose-200/20">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Algo no ha salido como esperábamos</h2>
                <p className="max-w-md text-slate-500 font-medium leading-relaxed mb-8">
                    Ha ocurrido un error al cargar el panel de control. Esto puede ser un problema temporal de conexión o un fallo técnico.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-8 p-4 bg-slate-100 rounded-2xl text-left font-mono text-xs text-rose-600 overflow-auto max-w-lg">
                        {error.message}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-xs font-black text-white uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reintentar
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 py-4 text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Home className="h-4 w-4" />
                        Ir al inicio
                    </Link>
                </div>
            </div>

            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                ID del error: <span className="text-slate-500">{error.digest || 'N/A'}</span>
            </p>
        </div>
    )
}
