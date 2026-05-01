'use client'

import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { markAllAsRead } from '@/app/actions/notifications'

export default function MarkAllButton() {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={() => startTransition(async () => await markAllAsRead())}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand/10 text-brand text-xs font-black uppercase tracking-widest hover:bg-brand/20 transition-all disabled:opacity-50"
        >
            <Check className="h-4 w-4" />
            Marcar todo como leído
        </button>
    )
}
