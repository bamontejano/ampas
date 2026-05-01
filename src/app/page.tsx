import Link from 'next/link'
import { ArrowRight, ShieldCheck, Heart, BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
          AMPA IES Cristo del Rosario
        </div>
        <Link
          href="/auth/login"
          className="text-sm font-bold text-brand hover:text-brand"
        >
          Iniciar sesión
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-bold mb-8 border border-brand/10">
          <ShieldCheck className="w-4 h-4" /> Entorno privado y seguro para familias
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-tight">
          La comunidad psicoeducativa del <span className="text-brand">IES Cristo del Rosario</span>
        </h1>

        <p className="mt-6 text-xl text-slate-500 max-w-2xl">
          Recursos premium, foros de apoyo familiar y herramientas de gestión educativa en un espacio único para nuestras familias.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand text-white font-bold text-lg hover:bg-brand transition-transform active:scale-95 shadow-lg shadow-indigo-200"
          >
            Acceder a la plataforma <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Registrarse
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><Heart className="w-6 h-6" /></div>
            <h3 className="font-bold text-slate-900 text-lg">Comunidad de apoyo</h3>
            <p className="text-slate-500 mt-2 text-sm">Foros seguros moderados por expertos para resolver dudas de crianza.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><BookOpen className="w-6 h-6" /></div>
            <h3 className="font-bold text-slate-900 text-lg">Biblioteca Premium</h3>
            <p className="text-slate-500 mt-2 text-sm">Guías, PDFs y vídeos clasificados por etapa educativa.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><ShieldCheck className="w-6 h-6" /></div>
            <h3 className="font-bold text-slate-900 text-lg">Tus Apps Exclusivas</h3>
            <p className="text-slate-500 mt-2 text-sm">Organiza el estudio y gestiona límites desde un solo lugar.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
