import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    // Roles allowed in this section: admin_ampa, junta (only for invites), and superadmin
    const allowedRoles = ['admin_ampa', 'junta', 'superadmin']

    if (!profile?.rol || !allowedRoles.includes(profile.rol)) {
        redirect('/dashboard')
    }

    return <>{children}</>
}
