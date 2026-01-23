export const fetchVacancies = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`)
    if (!res.ok) {
        throw new Error("Failed to fetch vacancies")
    }
    const vacancies = await res.json()
    return vacancies.data
}

export const saveJob = async (jobId: String) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${jobId}/save`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(jobId)
    })

    if (!res.ok) {
        throw new Error("Failed to save job")
    }

    const result = await res.json()
    return result.data
}

export const unsaveJob = async (jobId: String) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${jobId}/save`, {
        method:'DELETE',
        credentials: 'include',
        body: JSON.stringify(jobId)
    })

    if (!res.ok) {
        throw new Error("Failed to save job")
    }

    const result = await res.json()
    return result.data
}