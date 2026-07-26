import { deleteAdminJob, fetchAdminCandidate, fetchAdminDashboard, fetchAdminJob, fetchAdminJobs, fetchAllApplications, fetchAllUsers, fetchCandidateApplications, fetchCandidateFilterOptions, fetchJobCandidates, fetchTeamMembers, updateAdminJob, updateAdminJobStatus } from "@/api/admin"
import { AdminApplication, CandidateListFilters, Job, PaginatedResponse, User } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


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

export const useGetJobCandidates = (filters: CandidateListFilters = {}) => {
    return useQuery({
        queryKey: ['jobCandidates', filters],
        queryFn: () => fetchJobCandidates(filters),
    })
}

export const useCandidateFilterOptions = (jobSearch?: string) => useQuery({
    queryKey: ['candidateFilterOptions', jobSearch || ''],
    queryFn: () => fetchCandidateFilterOptions(jobSearch),
})

export const useAdminCandidate = (candidateId: string) => useQuery({
    queryKey: ['adminCandidate', candidateId],
    queryFn: () => fetchAdminCandidate(candidateId),
    enabled: Boolean(candidateId),
})

export const useCandidateApplications = (
    candidateId: string,
    page = 1,
    status?: string,
) => useQuery({
    queryKey: ['candidateApplications', candidateId, page, status || 'all'],
    queryFn: () => fetchCandidateApplications(candidateId, page, 10, status),
    enabled: Boolean(candidateId),
})

export const useAdminApplications = (page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<AdminApplication>>({
        queryKey:['adminApplications', page, limit],
        queryFn: () => fetchAllApplications(page, limit)
    })
}

export const useAdminJob = (jobId: string) => useQuery({
    queryKey: ['adminJob', jobId],
    queryFn: () => fetchAdminJob(jobId),
    enabled: Boolean(jobId),
})

export const useUpdateAdminJob = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateAdminJob,
        onSuccess: (job) => {
            queryClient.setQueryData(['adminJob', job._id], job)
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
        },
    })
}

export const useDeleteAdminJob = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteAdminJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
        },
    })
}

export const useUpdateAdminJobStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateAdminJobStatus,
        onSuccess: (job) => {
            queryClient.setQueryData(['adminJob', job._id], job)
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
            queryClient.invalidateQueries({ queryKey: ['vacancies'] })
            queryClient.invalidateQueries({ queryKey: ['recommendations'] })
            queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
            queryClient.invalidateQueries({ queryKey: ['application-status', job._id] })
        },
    })
}
