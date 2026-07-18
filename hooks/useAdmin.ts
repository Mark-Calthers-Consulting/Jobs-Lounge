import { fetchAdminDashboard, fetchAdminJobs, fetchAllApplications, fetchAllUsers, fetchJobCandidates, fetchTeamMembers } from "@/api/admin"
import { AdminApplication, Job, PaginatedResponse, User } from "@/types/types"
import { useQuery } from "@tanstack/react-query"


export const useAdminDashboard = () => {
    return useQuery({
        queryKey: ['adminDashboard'],
        queryFn: fetchAdminDashboard
    })
}

export const useAdminVacancies = (page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<Job>>({
        queryKey: ['adminVacancies', page, limit],
        queryFn: () => fetchAdminJobs(page, limit)
    })
}

export const useAdminUsers = (page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<User>>({
        queryKey: ['adminUsers', page, limit],
        queryFn: () => fetchAllUsers(page, limit)
    })
}

export const useGetTeamMembers = (page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<User>>({
        queryKey: ['teamMembers', page, limit],
        queryFn: () => fetchTeamMembers(page, limit)
    })
}

export const useGetJobCandidates = (page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<User>>({
        queryKey: ['jobCandidates', page, limit],
        queryFn: () => fetchJobCandidates(page, limit)
    })
}

export const useAdminApplications = (page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<AdminApplication>>({
        queryKey:['adminApplications', page, limit],
        queryFn: () => fetchAllApplications(page, limit)
    })
}
