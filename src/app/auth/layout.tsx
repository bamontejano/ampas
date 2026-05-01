import Image from 'next/image'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const ampaName = 'AMPA IES Cristo del Rosario'
    const ampaSchool = 'IES Cristo del Rosario'
    const primaryColor = '#4f46e5' // indigo-600

    const styleObj = {
        '--ampa-color': primaryColor,
    } as React.CSSProperties

    return (
        <div 
            className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4"
            style={styleObj}
        >
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
                
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl shadow-[var(--ampa-color)]/30" style={{ backgroundColor: 'var(--ampa-color)' }}>
                        <span className="text-3xl font-black">A</span>
                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                        {ampaName}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Espacio privado para familias del {ampaSchool}
                    </p>
                </div>

                <div className="pt-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
