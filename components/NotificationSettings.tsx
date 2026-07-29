'use client'

import { useUpdateNotificationPreferences, useUser } from '@/hooks/useUsers'
import type { NotificationPreferences } from '@/types/types'
import { useState } from 'react'
import { FiBell, FiBriefcase } from 'react-icons/fi'
import { toast } from 'sonner'

const preferenceDetails: Array<{
    key: keyof NotificationPreferences
    label: string
    description: string
    icon: typeof FiBell
}> = [
    {
        key: 'jobAlerts',
        label: 'New vacancy alerts',
        description: 'Receive email updates when new opportunities are published.',
        icon: FiBriefcase,
    },
    {
        key: 'newsletter',
        label: 'Career newsletter',
        description: 'Receive occasional career guidance and Jobs Lounge updates.',
        icon: FiBell,
    },
]

const NotificationSettings = ({ idPrefix }: { idPrefix: string }) => {
    const { data: user, isLoading, isError } = useUser()
    const update = useUpdateNotificationPreferences()
    const [pendingKey, setPendingKey] = useState<keyof NotificationPreferences | null>(null)

    if (isLoading) {
        return <p role="status" className="px-5 py-6 text-sm text-gray-600 sm:px-6">Loading email preferences…</p>
    }
    if (isError || !user) {
        return (
            <p role="alert" className="px-5 py-6 text-sm text-red-700 sm:px-6">
                Unable to load email preferences.
            </p>
        )
    }

    const preferences = user.notificationPreferences ?? { jobAlerts: false, newsletter: false }
    const changePreference = async (key: keyof NotificationPreferences, checked: boolean) => {
        setPendingKey(key)
        try {
            await update.mutateAsync({ [key]: checked })
            toast.success('Email preference saved')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to save email preference')
        } finally {
            setPendingKey(null)
        }
    }

    return (
        <div className="divide-y divide-gray-100">
            {preferenceDetails.map(({ key, label, description, icon: Icon }) => {
                const id = `${idPrefix}-${key}`
                const enabled = preferences[key]
                const saving = pendingKey === key
                return (
                    <div key={key} className="flex items-start justify-between gap-5 px-5 py-5 sm:px-6">
                        <div className="flex min-w-0 gap-3.5">
                            <span aria-hidden="true" className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#184aa2]">
                                <Icon size={18} />
                            </span>
                            <div>
                                <span id={`${id}-label`} className="font-semibold text-gray-900">{label}</span>
                                <p id={`${id}-description`} className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                                    {description}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2.5 pt-1">
                            <span aria-hidden="true" className="hidden text-xs font-medium text-gray-500 sm:inline">
                                {saving ? 'Saving…' : enabled ? 'On' : 'Off'}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                id={id}
                                aria-checked={enabled}
                                aria-labelledby={`${id}-label`}
                                aria-describedby={`${id}-description`}
                                disabled={update.isPending}
                                onClick={() => void changePreference(key, !enabled)}
                                className={`relative inline-flex h-6 w-11 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
                                    enabled
                                        ? 'border-[#184aa2] bg-[#184aa2]'
                                        : 'border-gray-300 bg-gray-200'
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`mt-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                                        enabled ? 'translate-x-[1.15rem]' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default NotificationSettings
