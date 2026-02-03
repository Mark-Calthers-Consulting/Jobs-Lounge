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