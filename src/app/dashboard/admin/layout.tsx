import { adminDb, getUser } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) redirect('/auth/login')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.exists ? profileDoc.data() : null

    // Solo administradores pueden acceder a esta sección
    if (profile?.rol !== 'admin') {
        redirect('/dashboard')
    }

    return <>{children}</>
}
