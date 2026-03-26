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

export const getSavedJobs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/saved-jobs`, {
        method: 'GET',
        credentials: 'include',
    })

    if (res.status === 401) return null

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed')
    }

    return result.data
}

export const editUserDetails = async (data: Object) => {
    console.log(data)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
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