import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import type {
    ApiSuccess,
    Job,
    JobFilterOptions,
    PaginatedResponse,
    RecommendedJob,
    SavedJobMutation,
    VacancyFilters,
} from '@/types/types'
import { readApiResponse } from './errors'

export const fetchVacancies = async (
    filters: VacancyFilters = {},
    signal?: AbortSignal,
): Promise<PaginatedResponse<Job>> => {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })

    if (filters.search) params.set('search', filters.search)
    for (const field of ['category', 'workMode', 'jobType', 'level', 'location'] as const) {
        for (const value of filters[field] ?? []) params.append(field, value)
    }
    if (filters.datePosted) params.set('datePosted', filters.datePosted)
    if (filters.experienceMin !== undefined) {
        params.set('experienceMin', String(filters.experienceMin))
    }
    if (filters.experienceMax !== undefined) {
        params.set('experienceMax', String(filters.experienceMax))
    }
    if (filters.salaryMin !== undefined) params.set('salaryMin', String(filters.salaryMin))
    if (filters.salaryDisclosed) params.set('salaryDisclosed', 'true')
    if (filters.sort) params.set('sort', filters.sort)

    const queryString = params.toString()
    const res = await fetch(
        `${apiPath('/jobs')}${queryString ? `?${queryString}` : ""}`,
        { signal },
    )
    return readApiResponse<PaginatedResponse<Job>>(res, 'Failed to fetch vacancies')
}

export const fetchJobFilterOptions = async (
    signal?: AbortSignal,
): Promise<JobFilterOptions> => {
    const res = await fetch(apiPath('/jobs/filter-options'), { signal })
    const result = await readApiResponse<ApiSuccess<JobFilterOptions>>(
        res,
        'Failed to load vacancy filters',
    )
    return result.data
}

export const fetchFeaturedJobs = async (
    signal?: AbortSignal,
): Promise<Job[]> => {
    const res = await fetch(apiPath('/jobs/featured'), { signal })
    const result = await readApiResponse<ApiSuccess<Job[]>>(
        res,
        'Failed to load latest vacancies',
    )
    return result.data
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

export const getRecommendedJobs = async (): Promise<RecommendedJob[]> => {
    const res = await fetch(apiPath('/jobs/recommended'), {
        credentials: 'include',
    })
    const recommended = await readApiResponse<ApiSuccess<RecommendedJob[]>>(res, 'Failed to get recommended jobs')
    return recommended.data
}
