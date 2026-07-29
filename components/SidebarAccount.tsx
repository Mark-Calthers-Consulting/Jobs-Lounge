import Link from 'next/link'

import type { User } from '@/types/types'

type SidebarAccountProps = {
    user: User
    profileHref: string
    showRole?: boolean
}

const displayNameFor = (user: User) => (
    user.name?.trim()
    || [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || user.email.split('@')[0]
)

const initialsFor = (name: string) => {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()

    return initials || 'JL'
}

const roleLabelFor = (role: User['role']) => {
    if (role === 'super-admin') return 'Super administrator'
    if (role === 'recruiter') return 'Recruiter'
    if (role === 'admin') return 'Administrator'
    return 'Candidate'
}

const SidebarAccount = ({
    user,
    profileHref,
    showRole = false,
}: SidebarAccountProps) => {
    const displayName = displayNameFor(user)

    return (
        <Link
            href={profileHref}
            className="group flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
            aria-label={`Open profile for ${displayName}`}
        >
            <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-[#184aa2] ring-1 ring-blue-100"
            >
                {initialsFor(displayName)}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-800">
                    {displayName}
                </span>
                <span className="block truncate text-xs text-gray-500">
                    {user.email}
                </span>
                {showRole ? (
                    <span className="mt-0.5 block text-[11px] font-medium text-[#184aa2]">
                        {roleLabelFor(user.role)}
                    </span>
                ) : null}
            </span>
        </Link>
    )
}

export default SidebarAccount
