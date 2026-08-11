import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    fetchCandidateOnboarding,
    saveOnboardingAcquisition,
    saveOnboardingInterests,
    snoozeCandidateOnboarding,
    updateOnboardingChecklist,
} from '@/api/onboarding'
import type { CandidateOnboarding } from '@/types/types'

export const candidateOnboardingKey = ['candidateOnboarding'] as const

const useOnboardingMutation = <TVariables,>(
    mutationFn: (variables: TVariables) => Promise<CandidateOnboarding>,
    invalidateRecommendations = false,
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn,
        onSuccess: (data) => {
            queryClient.setQueryData(candidateOnboardingKey, data)
            if (invalidateRecommendations) {
                void queryClient.invalidateQueries({ queryKey: ['recommendations'] })
            }
        },
    })
}

export const useCandidateOnboarding = (enabled = true) => useQuery({
    queryKey: candidateOnboardingKey,
    queryFn: fetchCandidateOnboarding,
    enabled,
    staleTime: 30_000,
})

export const useSaveOnboardingInterests = () => useOnboardingMutation(
    saveOnboardingInterests,
    true,
)

export const useSaveOnboardingAcquisition = () => useOnboardingMutation(
    saveOnboardingAcquisition,
    true,
)

export const useSnoozeCandidateOnboarding = () => useOnboardingMutation(
    snoozeCandidateOnboarding,
)

export const useUpdateOnboardingChecklist = () => useOnboardingMutation(
    updateOnboardingChecklist,
)
