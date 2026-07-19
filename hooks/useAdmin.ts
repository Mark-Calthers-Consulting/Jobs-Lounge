import { deleteAdminJob, fetchAdminDashboard, fetchAdminJob, fetchAdminJobs, fetchAllApplications, fetchAllUsers, fetchJobCandidates, fetchTeamMembers, updateAdminJob } from "@/api/admin"
import { AdminApplication, Job, PaginatedResponse, User } from "@/types/types"
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
