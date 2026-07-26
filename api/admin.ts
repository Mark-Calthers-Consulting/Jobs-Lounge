import { apiPath } from './base'
import type {
    AdminApplication,
    AdminCandidateDetail,
    ApiSuccess,
    CandidateApplication,
    CandidateFilterOptions,
    CandidateListFilters,
    CandidateSummary,
    DashboardStats,
    Job,
    PaginatedResponse,
    User,
} from '@/types/types'
import { readApiResponse } from './errors'
import { csrfFetch } from './csrf'
import type { JobFormType } from '@/schemas/jobSchema'
import type { JobStatus } from '@/constants/enums'

export const fetchAdminDashboard = async (): Promise<DashboardStats> => {
    const res = await fetch(apiPath('/admin/dashboard'),
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    const dashboard = await readApiResponse<ApiSuccess<DashboardStats>>(
        res,
        'Failed to fetch dashboard data',
    )
    return dashboard.data 
}

const pageQuery = (page = 1, limit = 20) => new URLSearchParams({
    page: String(page),
    limit: String(limit),
})

export const fetchAdminJobs = async (page = 1, limit = 20): Promise<PaginatedResponse<Job>> => {
    const res = await fetch(`${apiPath('/admin/getAllJobs')}?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    return readApiResponse<PaginatedResponse<Job>>(res, 'Failed to fetch vacancies')
}

export const fetchAllUsers = async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const res = await fetch(`${apiPath('/admin/getAllUsers')}?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    return readApiResponse<PaginatedResponse<User>>(res, 'Failed to fetch users')
}

export const fetchTeamMembers = async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const res = await fetch(`${apiPath('/admin/getTeamMembers')}?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    return readApiResponse<PaginatedResponse<User>>(res, 'Failed to fetch team')
}

export const fetchJobCandidates = async (
    filters: CandidateListFilters = {},
): Promise<PaginatedResponse<CandidateSummary>> => {
    const params = new URLSearchParams()
    Object.entries({ page: 1, limit: 20, ...filters }).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.set(key, String(value))
    })
    const res = await fetch(`${apiPath('/admin/candidates')}?${params}`,
        {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        }
    )
    return readApiResponse<PaginatedResponse<CandidateSummary>>(res, 'Failed to fetch candidates')
}

export const fetchCandidateFilterOptions = async (
    jobSearch?: string,
): Promise<CandidateFilterOptions> => {
    const params = new URLSearchParams()
    if (jobSearch) params.set('jobSearch', jobSearch)
    const suffix = params.size ? `?${params}` : ''
    const res = await fetch(apiPath(`/admin/candidates/filter-options${suffix}`), {
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<CandidateFilterOptions>>(
        res,
        'Unable to load candidate filters',
    )
    return result.data
}

export const fetchAdminCandidate = async (
    candidateId: string,
): Promise<AdminCandidateDetail> => {
    const res = await fetch(apiPath(`/admin/candidates/${encodeURIComponent(candidateId)}`), {
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<AdminCandidateDetail>>(
        res,
        'Unable to load candidate',
    )
    return result.data
}

export const fetchCandidateApplications = async (
    candidateId: string,
    page = 1,
    limit = 10,
    status?: string,
): Promise<PaginatedResponse<CandidateApplication>> => {
    const params = pageQuery(page, limit)
    if (status) params.set('status', status)
    const res = await fetch(
        `${apiPath(`/admin/candidates/${encodeURIComponent(candidateId)}/applications`)}?${params}`,
        { credentials: 'include', cache: 'no-store' },
    )
    return readApiResponse<PaginatedResponse<CandidateApplication>>(
        res,
        'Unable to load candidate applications',
    )
}

export const fetchAllApplications = async (page = 1, limit = 20): Promise<PaginatedResponse<AdminApplication>> => {
    const res = await fetch(`${apiPath('/admin/getApplications')}?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    return readApiResponse<PaginatedResponse<AdminApplication>>(res, 'Failed to fetch applications')

}

export const fetchAdminJob = async (jobId: string): Promise<Job> => {
    const res = await fetch(apiPath(`/jobs/admin/${encodeURIComponent(jobId)}`), {
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<Job>>(res, 'Unable to load job')
    return result.data
}

export const updateAdminJob = async ({
    jobId,
    data,
}: {
    jobId: string
    data: JobFormType
}): Promise<Job> => {
    const res = await csrfFetch(apiPath(`/jobs/${encodeURIComponent(jobId)}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...data,
            applyLink: data.applyLink ?? null,
            deadline: data.deadline ?? null,
        }),
    })
    const result = await readApiResponse<ApiSuccess<Job>>(res, 'Unable to update job')
    return result.data
}

export const updateAdminJobStatus = async ({
    jobId,
    status,
}: {
    jobId: string
    status: JobStatus
}): Promise<Job> => {
    const res = await csrfFetch(apiPath(`/jobs/${encodeURIComponent(jobId)}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    })
    const result = await readApiResponse<ApiSuccess<Job>>(res, 'Unable to update job status')
    return result.data
}

export const deleteAdminJob = async (jobId: string): Promise<{ jobId: string; deletedAt: string }> => {
    const res = await csrfFetch(apiPath(`/jobs/${encodeURIComponent(jobId)}`), {
        method: 'DELETE',
    })
    const result = await readApiResponse<ApiSuccess<{ jobId: string; deletedAt: string }>>(
        res,
        'Unable to delete job',
    )
    return result.data
}
