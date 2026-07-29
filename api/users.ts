import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import type { ApiSuccess, NotificationPreferences, PaginatedResponse, Job, StaffProfilePayload, User, UserUpdatePayload } from '@/types/types'
import { readApiResponse } from './errors'

export const fetchUser = async (): Promise<User | null> => {
    const res = await fetch(apiPath('/users/me'), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })

    if (res.status === 401) return null

    const result = await readApiResponse<ApiSuccess<User>>(res, 'Unable to load profile')

    return result.data
}

export const getSavedJobs = async (page = 1, limit = 20): Promise<PaginatedResponse<Job> | null> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/users/me/saved-jobs')}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    if (res.status === 401) return null

    const result = await readApiResponse<PaginatedResponse<Job>>(res, 'Unable to load saved jobs')

    return result
}

export const editUserDetails = async (data: UserUpdatePayload): Promise<User | null> => {
    const res = await csrfFetch(apiPath('/users/me'), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })

    if (res.status === 401) return null

    const result = await readApiResponse<ApiSuccess<User>>(res, 'Unable to update profile')

    return result.data
}

export const updateNotificationPreferences = async (
    data: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> => {
    const res = await csrfFetch(apiPath('/users/me/notification-preferences'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await readApiResponse<ApiSuccess<NotificationPreferences>>(
        res,
        'Unable to update notification preferences',
    )
    return result.data
}

export const updateStaffProfile = async (data: StaffProfilePayload): Promise<User> => {
    const res = await csrfFetch(apiPath('/users/me/staff-profile'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await readApiResponse<ApiSuccess<User>>(
        res,
        'Unable to update staff profile',
    )
    return result.data
}
