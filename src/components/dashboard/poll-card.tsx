'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2, BarChart3, Clock, Lock, Vote } from 'lucide-react'
import { castVote } from '@/app/actions/polls'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PollOption {
    id: string
    texto: string
    votos_count: number
}

interface PollCardProps {
    encuesta: {
        id: string
        pregunta: string
        descripcion: string | null
        termina_at: string | null
        opciones: PollOption[]
        votos_totales: number
        ya_voto: boolean
        voto_opcion_id?: string
    }
}

export default function PollCard({ encuesta }: PollCardProps) {
    const [isPending, startTransition] = useTransition()
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const totalVotes = encuesta.votos_totales || 0
    const isPast = encuesta.termina_at && new Date(encuesta.termina_at) < new Date()

    async function handleVote() {
        if (!selectedOption || isPending || encuesta.ya_voto || isPast) return

        setError(null)
        startTransition(async () => {
            try {
                await castVote(encuesta.id, selectedOption)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    return (
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-[10px] font-black text-brand uppercase tracking-widest">
                        <Vote className="h-3 w-3" />
                        {isPast ? 'Finalizada' : 'Votación Activa'}
                    </div>
                    {encuesta.termina_at && !isPast && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                            <Clock className="h-3 w-3" />
                            Cierra el {format(new Date(encuesta.termina_at), 'd MMM', { locale: es })}
                        </div>
                    )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {encuesta.pregunta}
                </h3>
                {encuesta.descripcion && (
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {encuesta.descripcion}
                    </p>
                )}
            </div>

            {/* Options */}
            <div className="space-y-3">
                {encuesta.opciones.map((opcion) => {
                    const percentage = totalVotes > 0 ? Math.round((opcion.votos_count / totalVotes) * 100) : 0
                    const isSelected = selectedOption === opcion.id
                    const isUserVoted = encuesta.voto_opcion_id === opcion.id
                    const showResults = encuesta.ya_voto || isPast

                    return (
                        <div
                            key={opcion.id}
                            className="relative group"
                        >
                            {!showResults ? (
                                <button
                                    onClick={() => setSelectedOption(opcion.id)}
                                    disabled={isPending}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${isSelected
                                            ? 'border-indigo-600 bg-brand/10/50 text-brand shadow-lg shadow-brand/10'
                                            : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-600'
                                        }`}
                                >
                                    <span className="font-bold text-sm">{opcion.texto}</span>
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-600 bg-brand' : 'border-slate-200 bg-white'
                                        }`}>
                                        {isSelected && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                </button>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm px-1 mb-1">
                                        <span className={`font-bold ${isUserVoted ? 'text-brand flex items-center gap-1.5' : 'text-slate-700'}`}>
                                            {opcion.texto}
                                            {isUserVoted && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                                        </span>
                                        <span className="text-slate-400 font-black">{percentage}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out rounded-full ${isUserVoted ? 'bg-brand' : 'bg-slate-300'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer / Action */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                    <BarChart3 className="h-4 w-4" />
                    {totalVotes} {totalVotes === 1 ? 'participante' : 'participantes'}
                </div>

                {!encuesta.ya_voto && !isPast && (
                    <button
                        onClick={handleVote}
                        disabled={!selectedOption || isPending}
                        className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>Votar ahora</>
                        )}
                    </button>
                )}

                {encuesta.ya_voto && (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                        <Check className="h-3.5 w-3.5" />
                        Gracias por participar
                    </div>
                )}
            </div>

            {error && (
                <div className="absolute top-2 left-2 right-2 bg-rose-50 text-rose-600 text-[10px] font-bold p-2 rounded-lg border border-rose-100 text-center animate-shake">
                    {error}
                </div>
            )}
        </div>
    )
}
