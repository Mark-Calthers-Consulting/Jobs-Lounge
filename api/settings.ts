import { apiPath } from './base'
import { csrfFetch } from './csrf'
import { readApiResponse } from './errors'
import type {
    ApiSuccess,
    OrganizationSettings,
    OrganizationSettingsUpdate,
    PublicPlatformSettings,
    VacancyCreationDefaults,
} from '@/types/types'

export const fetchPublicPlatformSettings = async (): Promise<PublicPlatformSettings> => {
    const response = await fetch(apiPath('/settings/public'), {
        method: 'GET',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<PublicPlatformSettings>>(
        response,
        'Unable to load platform settings',
    )
    return result.data
}

export const fetchOrganizationSettings = async (): Promise<OrganizationSettings> => {
    const response = await fetch(apiPath('/admin/settings/organization'), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<OrganizationSettings>>(
        response,
        'Unable to load organization settings',
    )
    return result.data
}

export const fetchVacancyCreationDefaults = async (): Promise<VacancyCreationDefaults> => {
    const response = await fetch(apiPath('/admin/settings/vacancy-defaults'), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<VacancyCreationDefaults>>(
        response,
        'Unable to load vacancy defaults',
    )
    return result.data
}

export const updateOrganizationSettings = async (
    payload: OrganizationSettingsUpdate,
): Promise<OrganizationSettings> => {
    const response = await csrfFetch(apiPath('/admin/settings/organization'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    const result = await readApiResponse<ApiSuccess<OrganizationSettings>>(
        response,
        'Unable to update organization settings',
    )
    return result.data
}
