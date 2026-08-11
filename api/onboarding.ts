import { apiPath } from './base'
import { csrfFetch } from './csrf'
import { readApiResponse } from './errors'
import type {
    ApiSuccess,
    CandidateOnboarding,
    OnboardingAcquisitionPayload,
    OnboardingInterestsPayload,
} from '@/types/types'

const readOnboarding = async (response: Response, message: string) => {
    const result = await readApiResponse<ApiSuccess<CandidateOnboarding>>(response, message)
    return result.data
}

export const fetchCandidateOnboarding = async (): Promise<CandidateOnboarding> => {
    const response = await fetch(apiPath('/users/me/onboarding'), {
        credentials: 'include',
        cache: 'no-store',
    })
    return readOnboarding(response, 'Unable to load account setup')
}

export const saveOnboardingInterests = async (
    payload: OnboardingInterestsPayload,
): Promise<CandidateOnboarding> => {
    const response = await csrfFetch(apiPath('/users/me/onboarding/interests'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    return readOnboarding(response, 'Unable to save job interests')
}

export const saveOnboardingAcquisition = async (
    payload: OnboardingAcquisitionPayload,
): Promise<CandidateOnboarding> => {
    const response = await csrfFetch(apiPath('/users/me/onboarding/acquisition'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    return readOnboarding(response, 'Unable to finish account setup')
}

export const snoozeCandidateOnboarding = async (
    currentStep: 1 | 2,
): Promise<CandidateOnboarding> => {
    const response = await csrfFetch(apiPath('/users/me/onboarding/snooze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStep }),
    })
    return readOnboarding(response, 'Unable to save setup progress')
}

export const updateOnboardingChecklist = async (
    collapsed: boolean,
): Promise<CandidateOnboarding> => {
    const response = await csrfFetch(apiPath('/users/me/onboarding/checklist'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collapsed }),
    })
    return readOnboarding(response, 'Unable to update account setup')
}
