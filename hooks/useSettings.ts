import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    fetchOrganizationSettings,
    fetchPublicPlatformSettings,
    updateOrganizationSettings,
} from '@/api/settings'
import type { PublicPlatformSettings } from '@/types/types'

export const DEFAULT_PUBLIC_SETTINGS: PublicPlatformSettings = {
    supportEmail: 'support@jobslounge.markcalthers.com',
    timeZone: 'Africa/Lagos',
}

export const usePublicPlatformSettings = () => useQuery({
    queryKey: ['platformSettings', 'public'],
    queryFn: fetchPublicPlatformSettings,
    staleTime: 60_000,
    retry: 1,
})

export const useOrganizationSettings = (enabled = true) => useQuery({
    queryKey: ['platformSettings', 'organization'],
    queryFn: fetchOrganizationSettings,
    enabled,
})

export const useUpdateOrganizationSettings = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateOrganizationSettings,
        onSuccess: (settings) => {
            queryClient.setQueryData(['platformSettings', 'organization'], settings)
            queryClient.setQueryData<PublicPlatformSettings>(
                ['platformSettings', 'public'],
                {
                    supportEmail: settings.supportEmail,
                    timeZone: settings.timeZone,
                },
            )
        },
    })
}
