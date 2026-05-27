'use server'

import { adminDb, getUser } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'

export async function createResource(formData: FormData) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (!profile || profile.rol !== 'admin') {
        throw new Error('No tienes permisos para crear recursos')
    }

    const titulo = formData.get('titulo') as string
    const descripcion = formData.get('descripcion') as string
    const tipo = formData.get('tipo') as string
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()) || []
    const etapas = (formData.get('etapas') as string)?.split(',').map(t => t.trim()) || []
    const imagen_url = formData.get('imagen_url') as string
    const archivo_url = formData.get('archivo_url') as string
    const destacado = formData.get('destacado') === 'true'

    const newRef = adminDb.collection('recursos').doc()
    await newRef.set({
        id: newRef.id,
        ampa_id: profile.ampa_id,
        titulo,
        descripcion,
        tipo,
        tags,
        etapa_educativa: etapas,
        imagen_url: imagen_url || null,
        archivo_url: archivo_url || null,
        destacado,
        publico: true,
        created_at: new Date().toISOString()
    })

    revalidatePath('/dashboard/recursos')
}

export async function deleteResource(id: string) {
    const user = await getUser()
    if (!user) throw new Error('No autorizado')

    const profileDoc = await adminDb.collection('profiles').doc(user.uid).get()
    const profile = profileDoc.data()

    if (!profile || profile.rol !== 'admin') {
        throw new Error('No tienes permisos para eliminar recursos')
    }

    await adminDb.collection('recursos').doc(id).delete()

    revalidatePath('/dashboard/recursos')
}
