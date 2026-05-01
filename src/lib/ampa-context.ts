import { headers } from 'next/headers'
import { cookies } from 'next/headers'

/**
 * Get the current AMPA slug from subdomain (Server Components only).
 * Returns null if accessing from the root domain.
 */
export async function getAmpaSlug(): Promise<string | null> {
    // Try header first (set by middleware)
    const headerList = await headers()
    const slugFromHeader = headerList.get('x-ampa-slug')
    if (slugFromHeader) return slugFromHeader

    // Fallback to cookie
    const cookieStore = await cookies()
    const slugFromCookie = cookieStore.get('ampa-slug')?.value
    return slugFromCookie || null
}

/**
 * Get the current AMPA slug from cookie (Client Components).
 * Call this from client-side code.
 */
export function getAmpaSlugClient(): string | null {
    if (typeof document === 'undefined') return null

    const match = document.cookie.match(/(?:^|;\s*)ampa-slug=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
}
