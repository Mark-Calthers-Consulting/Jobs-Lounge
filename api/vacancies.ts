import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import type { ApiSuccess, Job, PaginatedResponse, SavedJobMutation } from '@/types/types'
import { readApiResponse } from './errors'

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
    return readApiResponse<PaginatedResponse<Job>>(res, 'Failed to fetch vacancies')
}

export const saveJob = async (jobId: string): Promise<SavedJobMutation> => {
    const res = await csrfFetch(apiPath(`/users/me/${encodeURIComponent(jobId)}/save`), {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(jobId)
    })

    const result = await readApiResponse<ApiSuccess<SavedJobMutation>>(res, 'Failed to save job')
    return result.data
}

export const unsaveJob = async (jobId: string): Promise<SavedJobMutation> => {
    const res = await csrfFetch(apiPath(`/users/me/${encodeURIComponent(jobId)}/save`), {
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify(jobId)
    })

    const result = await readApiResponse<ApiSuccess<SavedJobMutation>>(res, 'Failed to remove saved job')
    return result.data
}

export const checkApplicationStatus = async (jobId: string): Promise<boolean> => {
    const res = await fetch(apiPath(`/jobs/${encodeURIComponent(jobId)}/application-status`), {
        credentials: 'include',
    })
    const vacancies = await readApiResponse<ApiSuccess<boolean>>(
        res,
        'Failed to check application status',
    )
    return vacancies.data
}

export const getRecommendedJobs = async (): Promise<Job[]> => {
    const res = await fetch(apiPath('/jobs/recommended'), {
        credentials: 'include',
    })
    const recommended = await readApiResponse<ApiSuccess<Job[]>>(res, 'Failed to get recommended jobs')
    return recommended.data
}
