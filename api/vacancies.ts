export const fetchVacancies = async (searchTerm: String) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs?search=${searchTerm}&type=full&salary=12`)
    if (!res.ok) {
        throw new Error("Failed to fetch vacancies")
    }
    const vacancies = await res.json()
    return vacancies.data
}

export const saveJob = async (jobId: String) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/${jobId}/save`, {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/${jobId}/save`, {
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify(jobId)
    })

    if (!res.ok) {
        throw new Error("Failed to save job")
    }

    const result = await res.json()
    return result.data
}

export const checkApplicationStatus = async (jobId: String) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${jobId}/application-status`, {
        credentials: 'include',
    })
    if (!res.ok) {
        throw new Error("Failed to check application status")
    }
    const vacancies = await res.json()
    return vacancies.data
}

export const getRecommendedJobs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/recommended`, {
        credentials: 'include',
    })
    if (!res.ok) {
        throw new Error("Failed to get recommended jobs")
    }
    const recommended = await res.json()
    return recommended.data
}