import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatDateRelative(date: string | Date) {
    const now = new Date()
    const d = new Date(date)
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora mismo'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return formatDate(date)
}

export function getInitials(name: string | null | undefined): string {
    if (!name) return '?'
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

export function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}
