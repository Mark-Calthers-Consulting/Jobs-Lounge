import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import type { ApiSuccess, PaginatedResponse, Job, User, UserUpdatePayload } from '@/types/types'

export const fetchUser = async (): Promise<User | null> => {
    const res = await fetch(apiPath('/users/me'), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })

    if (res.status === 401) return null

    const result = await res.json() as ApiSuccess<User> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

export const getSavedJobs = async (page = 1, limit = 20): Promise<PaginatedResponse<Job> | null> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/users/me/saved-jobs')}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    if (res.status === 401) return null

    const result = await res.json() as PaginatedResponse<Job> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed')
    }

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

    const result = await res.json() as ApiSuccess<User> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed')
    }

    return result.data
}
