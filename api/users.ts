import { csrfFetch } from "./csrf"
import { apiPath } from "./base"

export const fetchUser = async () => {
    const res = await fetch(apiPath('/users/me'), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })

    if (res.status === 401) return null

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

export const getSavedJobs = async (page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/users/me/saved-jobs')}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    if (res.status === 401) return null

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed')
    }

    return result
}

export const editUserDetails = async (data: Record<string, unknown>) => {
    const res = await csrfFetch(apiPath('/users/me'), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })

    if (res.status === 401) return null

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed')
    }

    return result.data
}
