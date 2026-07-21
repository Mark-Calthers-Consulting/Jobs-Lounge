import { apiPath } from './base'
import type {
    AdminApplication,
    ApiSuccess,
    DashboardStats,
    Job,
    PaginatedResponse,
    User,
} from '@/types/types'
import { readApiResponse } from './errors'
import { csrfFetch } from './csrf'
import type { JobFormType } from '@/schemas/jobSchema'

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

export const fetchJobCandidates = async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const res = await fetch(`${apiPath('/admin/getCandidates')}?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    return readApiResponse<PaginatedResponse<User>>(res, 'Failed to fetch candidates')
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

export const closeAdminJob = async (jobId: string): Promise<Job> => {
    const res = await csrfFetch(apiPath(`/jobs/${encodeURIComponent(jobId)}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' }),
    })
    const result = await readApiResponse<ApiSuccess<Job>>(res, 'Unable to close job')
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
