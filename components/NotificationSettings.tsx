'use client'

import { useUpdateNotificationPreferences, useUser } from '@/hooks/useUsers'
import type { NotificationPreferences } from '@/types/types'
import { toast } from 'sonner'

const preferenceDetails: Array<{
    key: keyof NotificationPreferences
    label: string
    description: string
}> = [
    {
        key: 'jobAlerts',
        label: 'New job alerts',
        description: 'Get notified when new jobs matching your profile are posted',
    },
    {
        key: 'newsletter',
        label: 'Newsletter',
        description: 'Receive weekly job market insights and career tips',
    },
]

const NotificationSettings = ({ idPrefix }: { idPrefix: string }) => {
    const { data: user, isLoading, isError } = useUser()
    const update = useUpdateNotificationPreferences()

    if (isLoading) return <p role="status">Loading notification preferences…</p>
    if (isError || !user) return <p role="alert" className="text-red-700">Unable to load notification preferences.</p>

    const preferences = user.notificationPreferences ?? { jobAlerts: false, newsletter: false }
    const changePreference = async (key: keyof NotificationPreferences, checked: boolean) => {
        try {
            await update.mutateAsync({ [key]: checked })
            toast.success('Notification preference saved')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to save preference')
        }
    }

    return (
        <div className="my-6">
            {preferenceDetails.map(({ key, label, description }, index) => {
                const id = `${idPrefix}-${key}`
                return (
                    <div key={key} className={`flex justify-between gap-6 py-4 ${index === 0 ? 'border-b border-gray-400' : ''}`}>
                        <div>
                            <label htmlFor={id} className="font-semibold">{label}</label>
                            <p id={`${id}-description`} className="text-gray-600">{description}</p>
                        </div>
                        <input
                            type="checkbox"
                            id={id}
                            checked={preferences[key]}
                            disabled={update.isPending}
                            aria-describedby={`${id}-description`}
                            onChange={(event) => void changePreference(key, event.target.checked)}
                            className="h-5 w-5"
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default NotificationSettings
