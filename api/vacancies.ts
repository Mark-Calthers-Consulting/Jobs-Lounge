import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import type { ApiSuccess, Job, PaginatedResponse, SavedJobMutation } from '@/types/types'

export const fetchVacancies = async (
    searchTerm: string,
    page = 1,
    limit = 20,
    signal?: AbortSignal,
): Promise<PaginatedResponse<Job>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })

    if (searchTerm) {
        params.append('search', searchTerm)
    }

    const queryString = params.toString()
    const res = await fetch(
        `${apiPath('/jobs')}${queryString ? `?${queryString}` : ""}`,
        { signal },
    )
    if (!res.ok) {
        throw new Error("Failed to fetch vacancies")
    }
    return res.json() as Promise<PaginatedResponse<Job>>
}

export const saveJob = async (jobId: string): Promise<SavedJobMutation> => {
    const res = await csrfFetch(apiPath(`/users/me/${encodeURIComponent(jobId)}/save`), {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(jobId)
    })

    if (!res.ok) {
        throw new Error("Failed to save job")
    }

    const result = await res.json() as ApiSuccess<SavedJobMutation>
    return result.data
}

export const unsaveJob = async (jobId: string): Promise<SavedJobMutation> => {
    const res = await csrfFetch(apiPath(`/users/me/${encodeURIComponent(jobId)}/save`), {
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify(jobId)
    })

    if (!res.ok) {
        throw new Error("Failed to save job")
    }

    const result = await res.json() as ApiSuccess<SavedJobMutation>
    return result.data
}

export const checkApplicationStatus = async (jobId: string): Promise<boolean> => {
    const res = await fetch(apiPath(`/jobs/${encodeURIComponent(jobId)}/application-status`), {
        credentials: 'include',
    })
    if (!res.ok) {
        throw new Error("Failed to check application status")
    }
    const vacancies = await res.json() as ApiSuccess<boolean>
    return vacancies.data
}

export const getRecommendedJobs = async (): Promise<Job[]> => {
    const res = await fetch(apiPath('/jobs/recommended'), {
        credentials: 'include',
    })
    if (!res.ok) {
        throw new Error("Failed to get recommended jobs")
    }
    const recommended = await res.json() as ApiSuccess<Job[]>
    return recommended.data
}
