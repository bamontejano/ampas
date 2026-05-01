import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import {
    Home,
    Users,
    BookOpen,
    Gamepad2,
    Calendar,
    LogOut,
    Settings,
    Vote,
    Ticket,
    UserCog,
    ChevronRight,
    Building2,
    LayoutGrid,
    Shield,
    Bell
} from 'lucide-react'
import NotificationBell from '@/components/dashboard/notification-bell'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    let profile = null
    let ampa = null

    try {
        const { data: profileRaw, error: profileError } = await supabase
            .from('profiles')
            .select('*, ampas(*)')
            .eq('id', user.id)
            .maybeSingle()

        if (profileRaw) {
            profile = profileRaw as any
            ampa = profile?.ampas
        }
    } catch (e) {
        console.error('Error in DashboardLayout:', e)
    }

    const ampaName = 'AMPA IES Cristo del Rosario'

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

    const rol = profile?.rol || 'user'
    const isAdmin = rol === 'admin'

    // AMPA admin nav: admin only
    const ampaAdminNavItems = isAdmin ? [
        { name: 'Usuarios', href: '/dashboard/admin/usuarios', icon: UserCog },
        { name: 'Comunicados', href: '/dashboard/admin/mensajeria', icon: Bell },
        { name: 'Gestionar Apps', href: '/dashboard/admin/apps', icon: LayoutGrid },
        { name: 'Ajustes', href: '/dashboard/admin/perfil-ampa', icon: Settings },
        { name: 'Invitaciones', href: '/dashboard/admin/invitaciones', icon: Ticket },
    ] : []

    const primaryColor = '#4f46e5'

    return (
        <div className="flex min-h-screen bg-slate-50/50" style={{ ['--brand-primary' as any]: primaryColor }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .text-brand { color: var(--brand-primary); }
                .bg-brand { background-color: var(--brand-primary); }
                .border-brand { border-color: var(--brand-primary); }
                .hover\\:text-brand:hover { color: var(--brand-primary); }
                .hover\\:bg-brand:hover { background-color: var(--brand-primary); }
                .focus\\:ring-brand:focus { --tw-ring-color: var(--brand-primary); }
            `}} />
            {/* Sidebar Desktop */}
            <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b border-slate-200 px-6 gap-3">
                        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white overflow-hidden shadow-sm ring-1 ring-slate-100 shrink-0">
                            {ampa?.logo_url ? (
                                <img src={ampa.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold">A</span>
                            )}
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight truncate">
                            {ampaName}
                        </span>
                    </div>

                    <div className="flex flex-col flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100 hover:text-brand transition-all group"
                            >
                                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {item.name}
                            </Link>
                        ))}

                        {/* AMPA Admin Section */}
                        {ampaAdminNavItems.length > 0 && (
                            <div className="pt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Administración</span>
                                </div>
                                {ampaAdminNavItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-brand/5 hover:text-brand transition-all group"
                                    >
                                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        {item.name}
                                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Section */}
                    <div className="p-4 mt-auto border-t border-slate-200">
                        <div className="flex items-center gap-3 px-2 mb-4">
                            <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold border-2 border-white shadow-sm">
                                {profile?.nombre_completo?.[0] || 'U'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-slate-900 truncate">{profile?.nombre_completo}</p>
                                <p className="text-xs truncate font-semibold"
                                    style={{ color: rol === 'admin' ? '#4f46e5' : '#6b7280' }}>
                                    {rol === 'admin' ? 'Administrador' : 'Miembro'}
                                </p>
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
                    <div className="flex items-center gap-2 lg:hidden overflow-hidden max-w-[200px]">
                        <div className="h-6 w-6 rounded-md bg-brand flex items-center justify-center text-white shrink-0 overflow-hidden">
                             {ampa?.logo_url ? (
                                <img src={ampa.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-xs">A</span>
                            )}
                        </div>
                        <h1 className="text-sm font-black text-slate-900 truncate">{ampaName}</h1>
                    </div>
                    <div className="hidden lg:block text-slate-500 text-sm font-medium italic">
                        Comunidad IES Cristo del Rosario
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell
                            initialNotifications={notifications}
                            perfilId={user?.id as string}
                        />
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 lg:hidden font-bold">
                            {profile?.nombre_completo?.[0] || 'U'}
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
                            className="flex flex-col items-center gap-1 p-2 text-[10px] font-medium text-slate-600 hover:text-brand"
                        >
                            <item.icon className="w-6 h-6" />
                            {item.name}
                        </Link>
                    ))}
                    {ampaAdminNavItems.length > 0 && (
                        <Link
                            href="/dashboard/admin/usuarios"
                            className="flex flex-col items-center gap-1 p-2 text-[10px] font-medium text-brand"
                        >
                            <UserCog className="w-6 h-6" />
                            Admin
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    )
}
