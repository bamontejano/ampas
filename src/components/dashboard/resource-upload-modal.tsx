'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import SubirRecursoForm from '@/components/dashboard/subir-recurso-form'

export default function ResourceUploadModal({ ampaId }: { ampaId: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-2xl bg-brand px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95"
            >
                <Plus className="h-5 w-5" />
                Subir Recurso
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors z-10"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="p-8 max-h-[90vh] overflow-y-auto">
                            <SubirRecursoForm ampaId={ampaId} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
