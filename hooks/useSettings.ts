import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    fetchOrganizationSettings,
    fetchPublicPlatformSettings,
    fetchStaffFeatureSettings,
    updateOrganizationSettings,
} from '@/api/settings'
import type { PublicPlatformSettings } from '@/types/types'

export const DEFAULT_PUBLIC_SETTINGS: PublicPlatformSettings = {
    supportEmail: 'support@jobslounge.markcalthers.com',
    timeZone: 'Africa/Lagos',
    candidateRegistrationEnabled: true,
    academicQualificationEnforcementEnabled: false,
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

export const useStaffFeatureSettings = (enabled = true, staffId?: string) => useQuery({
    queryKey: ['platformSettings', 'staffFeatures', staffId],
    queryFn: fetchStaffFeatureSettings,
    enabled,
    staleTime: 60_000,
    retry: 1,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
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
                    candidateRegistrationEnabled: settings.candidateRegistrationEnabled,
                    academicQualificationEnforcementEnabled:
                        settings.academicQualificationEnforcementEnabled,
                },
            )
            queryClient.invalidateQueries({ queryKey: ['platformSettings', 'staffFeatures'] })
        },
    })
}
