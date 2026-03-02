'use client'

import { useState, useTransition } from 'react'
import { updateMemberRole, removeMember } from '@/app/actions/admin'
import { ChevronDown, Trash2, Loader2, ShieldCheck, Users, Crown } from 'lucide-react'

type Role = 'familia' | 'junta' | 'admin_ampa'

interface UserRowActionsProps {
    memberId: string
    currentRole: Role
    currentUserId: string
}

const roleLabels: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
    familia: {
        label: 'Familia',
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: <Users className="h-3.5 w-3.5" />,
    },
    junta: {
        label: 'Junta',
        color: 'bg-blue-50 text-blue-600 border-blue-200',
        icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    admin_ampa: {
        label: 'Admin',
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        icon: <Crown className="h-3.5 w-3.5" />,
    },
}

export function UserRoleBadge({ role }: { role: Role }) {
    const config = roleLabels[role] ?? roleLabels.familia
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-tight border ${config.color}`}>
            {config.icon}
            {config.label}
        </span>
    )
}

export function UserRowActions({ memberId, currentRole, currentUserId }: UserRowActionsProps) {
    const [role, setRole] = useState<Role>(currentRole)
    const [showRoleMenu, setShowRoleMenu] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const isSelf = memberId === currentUserId

    const handleRoleChange = (newRole: Role) => {
        if (newRole === role) { setShowRoleMenu(false); return }
        setShowRoleMenu(false)
        setError(null)
        startTransition(async () => {
            try {
                await updateMemberRole(memberId, newRole)
                setRole(newRole)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    const handleRemove = () => {
        setShowConfirm(false)
        setError(null)
        startTransition(async () => {
            try {
                await removeMember(memberId)
            } catch (err: any) {
                setError(err.message)
            }
        })
    }

    if (isSelf) {
        return (
            <div className="flex items-center justify-end">
                <UserRoleBadge role={role} />
                <span className="ml-3 text-xs text-slate-400 font-medium">(tú)</span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {error && (
                <span className="text-xs text-rose-500 font-medium max-w-[120px] truncate" title={error}>
                    {error}
                </span>
            )}

            {/* Role Selector */}
            <div className="relative">
                <button
                    onClick={() => setShowRoleMenu(v => !v)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-tight border transition-all hover:opacity-80 ${roleLabels[role]?.color ?? roleLabels.familia.color}`}
                >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : roleLabels[role]?.icon}
                    {roleLabels[role]?.label ?? 'Familia'}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {showRoleMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden py-1">
                            {(Object.keys(roleLabels) as Role[]).map(r => (
                                <button
                                    key={r}
                                    onClick={() => handleRoleChange(r)}
                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-tight transition-colors hover:bg-slate-50 ${role === r ? 'text-indigo-600' : 'text-slate-600'}`}
                                >
                                    {roleLabels[r].icon}
                                    {roleLabels[r].label}
                                    {role === r && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Remove Button / Confirm Dialog */}
            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isPending}
                    className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                    title="Eliminar miembro"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            ) : (
                <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">¿Seguro?</span>
                    <button
                        onClick={handleRemove}
                        disabled={isPending}
                        className="rounded-lg bg-rose-500 px-2 py-1 text-xs font-black text-white hover:bg-rose-600 transition-colors"
                    >
                        Sí
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        No
                    </button>
                </div>
            )}
        </div>
    )
}
