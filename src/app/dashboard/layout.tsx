import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import {
    Home,
    Users,
    BookOpen,
    Gamepad2,
    Calendar,
    LogOut,
    User,
    Settings,
    Bell,
    Vote
} from 'lucide-react'
import NotificationBell from '@/components/dashboard/notification-bell'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('*, ampas(*)')
        .eq('id', user?.id as string)
        .single()

    const profile = profileRaw as any
    const ampa = profile?.ampas

    // Fetch notifications
    const { data: notificationsRaw } = await supabase
        .from('notificaciones' as any)
        .select('*')
        .eq('perfil_id', user?.id as string)
        .order('created_at', { ascending: false })
        .limit(10)

    const notifications = notificationsRaw as any[] || []

    const navItems = [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        { name: 'Comunidad', href: '/dashboard/comunidad', icon: Users },
        { name: 'Biblioteca', href: '/dashboard/recursos', icon: BookOpen },
        { name: 'Eventos', href: '/dashboard/eventos', icon: Calendar },
        { name: 'Votaciones', href: '/dashboard/votaciones', icon: Vote },
        { name: 'Mis Apps', href: '/dashboard/apps', icon: Gamepad2 },
    ]

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar Desktop */}
            <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b border-slate-200 px-6">
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                            AMPA Connect
                        </span>
                    </div>

                    <div className="flex flex-col flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all group"
                            >
                                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="p-4 mt-auto border-t border-slate-200">
                        <div className="flex items-center gap-3 px-2 mb-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                                {profile?.nombre_completo?.[0] || 'U'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-slate-900 truncate">{profile?.nombre_completo}</p>
                                <p className="text-xs text-slate-500 truncate">{ampa?.nombre || 'Mi AMPA'}</p>
                            </div>
                        </div>

                        <form action={logout}>
                            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors">
                                <LogOut className="w-5 h-5" />
                                Cerrar sesión
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-64 w-full">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
                    <h1 className="text-lg font-semibold text-slate-900 lg:hidden">AMPA Connect</h1>
                    <div className="hidden lg:block text-slate-500 text-sm font-medium italic">
                        {ampa?.colegio_nombre ? `Comunidad del ${ampa.colegio_nombre}` : 'Psicoeducación y Comunidad'}
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell
                            initialNotifications={notifications}
                            perfilId={user?.id as string}
                        />
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 lg:hidden font-bold">
                            {profile?.nombre_completo?.[0]}
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-2 lg:hidden">
                <div className="flex justify-around items-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center gap-1 p-2 text-[10px] font-medium text-slate-600 hover:text-indigo-600"
                        >
                            <item.icon className="w-6 h-6" />
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
