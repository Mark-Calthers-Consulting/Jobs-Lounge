import { csrfFetch } from "./csrf"

export const fetchUser = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        method: 'GET',
        credentials: 'include',
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/saved-jobs?${params}`, {
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

export const editUserDetails = async (data: Object) => {
    const res = await csrfFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
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
