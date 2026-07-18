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
