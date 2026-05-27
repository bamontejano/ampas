import { adminDb, getUser } from '@/lib/firebase/admin'
import {
    Vote,
    Plus,
    History,
    Info,
    Search,
    ChevronRight,
    LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import PollCard from '@/components/dashboard/poll-card'

export default async function VotacionesPage() {
    const user = await getUser()

    if (!user) return null

    // Get current user profile for ampa_id
    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.exists ? profileDoc.data() : null

    // Fetch active polls
    const encuestasSnapshot = await adminDb.collection('encuestas')
        .where('ampa_id', '==', profile?.ampa_id || '')
        .where('activa', '==', true)
        .get()
    const encuestasRaw = encuestasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]

    // Fetch options for active polls
    let opcionesRaw: any[] = []
    if (encuestasRaw.length > 0) {
        const pollIds = encuestasRaw.map(e => e.id)
        // If there are more than 10, Firestore 'in' query has a limit of 10.
        // Let's batch/chunk it just in case, or do a simple in query if <= 10.
        // Assuming usually <= 10 active polls.
        const chunks = []
        for (let i = 0; i < pollIds.length; i += 10) {
            chunks.push(pollIds.slice(i, i + 10))
        }
        const optionDocs = await Promise.all(
            chunks.map(chunk => 
                adminDb.collection('encuesta_opciones')
                    .where('encuesta_id', 'in', chunk)
                    .get()
            )
        )
        opcionesRaw = optionDocs.flatMap(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }

    // Fetch current user's votes
    const misVotosSnapshot = await adminDb.collection('encuesta_votos')
        .where('perfil_id', '==', user.uid)
        .get()
    const misVotosRaw = misVotosSnapshot.docs.map(doc => doc.data())

    const misVotos = new Map(misVotosRaw.map(v => [v.encuesta_id, v.opcion_id]))

    // Process encuestas to include voting status for current user
    const encuestas = encuestasRaw.map(encuesta => {
        const opciones = opcionesRaw.filter(op => op.encuesta_id === encuesta.id)
        return {
            ...encuesta,
            opciones: opciones,
            votos_totales: opciones.reduce((acc: number, op: any) => acc + (op.votos_count || 0), 0),
            ya_voto: misVotos.has(encuesta.id),
            voto_opcion_id: misVotos.get(encuesta.id)
        }
    })

    return (
        <div className="space-y-12 pb-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-2xl">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Centro de Votaciones</h2>
                    <p className="mt-4 text-slate-500 text-xl leading-relaxed">
                        Tu opinión da forma a nuestra comunidad. Participa en las decisiones del centro.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 rounded-[1.5rem] bg-white border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95">
                        <History className="h-4 w-4" /> Historial
                    </button>
                    {profile?.rol === 'admin' && (
                        <Link
                            href="/dashboard/votaciones/nueva"
                            className="flex items-center gap-2 rounded-[1.5rem] bg-brand px-8 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95"
                        >
                            <Plus className="h-5 w-5" /> Nueva Votación
                        </Link>
                    )}
                </div>
            </div>

            {/* Warning / Info Banner */}
            <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10 transition-transform group-hover:scale-110">
                    <Vote className="h-64 w-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="h-5 w-5 text-brand/80" />
                            <span className="text-xs font-black uppercase tracking-widest text-brand/80">Importante</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2">Voto único y seguro</h3>
                        <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                            Para garantizar la transparencia, solo se permite un voto por perfil de familia verificado.
                            Tus respuestas son procesadas de forma segura y ética.
                        </p>
                    </div>
                </div>
            </div>

            {encuestas && encuestas.length > 0 ? (
                <div className="grid gap-10 lg:grid-cols-2">
                    {encuestas.map((encuesta) => (
                        <PollCard key={encuesta.id} encuesta={encuesta} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200 text-center px-10 shadow-sm">
                    <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center mb-10 shadow-inner">
                        <Vote className="h-16 w-16 text-slate-300" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Sin votaciones abiertas</h3>
                    <p className="text-slate-500 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
                        Actualmente no hay decisiones pendientes que requieran tu voto.
                        ¡Gracias por estar atento a nuestra comunidad!
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-brand font-bold hover:underline"
                    >
                        Volver al inicio <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </div>
    )
}
