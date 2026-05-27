'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    
    revalidatePath('/', 'layout')
    redirect('/auth/login')
}

export async function resetPassword(formData: FormData) {
    // This should ideally be moved to client-side as Firebase Auth handles password resets client-side via sendPasswordResetEmail
    // If you need server-side, you'd use admin.auth().generatePasswordResetLink, but then you'd need to send the email yourself.
    return { error: 'Por favor, utiliza la opción de recuperar contraseña en el cliente.' }
}
