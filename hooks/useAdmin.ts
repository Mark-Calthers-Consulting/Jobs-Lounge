import { cancelScheduledTeamEmail, cancelStaffInvitation, createStaffMember, deleteAdminJob, deleteCandidateAccount, fetchAdminCandidate, fetchAdminDashboard, fetchAdminJob, fetchAdminJobs, fetchAllUsers, fetchCandidateApplications, fetchCandidateEmailHistory, fetchCandidateEmailRecipients, fetchCandidateFilterOptions, fetchJobCandidates, fetchTeamEmailHistory, fetchTeamEmailRecipients, fetchTeamMembers, queueCandidateEmail, queueTeamEmail, resendStaffInvitation, restoreAdminJob, signOutAllTeamMembers, type TeamFilters, updateAdminJob, updateAdminJobStatus, updateStaffRole, updateStaffSuspension } from "@/api/admin"
import { AdminJobListFilters, CandidateEmailRecipientFilters, CandidateListFilters, Job, PaginatedResponse, StaffMember, TeamEmailRecipientFilters, User } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const useAdminDashboard = () => {
    return useQuery({
        queryKey: ['adminDashboard'],
        queryFn: fetchAdminDashboard
    })
}

export const useAdminVacancies = (filters: AdminJobListFilters = {}) => {
    return useQuery({
        queryKey: ['adminVacancies', filters],
        queryFn: () => fetchAdminJobs(filters)
    })
}

export const useAdminUsers = (page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<User>>({
        queryKey: ['adminUsers', page, limit],
        queryFn: () => fetchAllUsers(page, limit)
    })
}

export const useGetTeamMembers = (filters: TeamFilters = {}) => {
    return useQuery<PaginatedResponse<StaffMember>>({
        queryKey: ['teamMembers', filters],
        queryFn: () => fetchTeamMembers(filters)
    })
}

export const useCreateStaffMember = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createStaffMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
        },
    })
}

export const useUpdateStaffRole = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateStaffRole,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamMembers'] }),
    })
}

export const useResendStaffInvitation = () => useMutation({
    mutationFn: resendStaffInvitation,
})

export const useCancelStaffInvitation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: cancelStaffInvitation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
        },
    })
}

export const useUpdateStaffSuspension = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateStaffSuspension,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamMembers'] }),
    })
}

export const useSignOutAllTeamMembers = () => useMutation({
    mutationFn: signOutAllTeamMembers,
})

export const useTeamEmailRecipients = (filters: TeamEmailRecipientFilters) => useQuery({
    queryKey: ['teamEmailRecipients', filters],
    queryFn: () => fetchTeamEmailRecipients(filters),
})

export const useTeamEmailHistory = (page = 1) => useQuery({
    queryKey: ['teamEmailHistory', page],
    queryFn: () => fetchTeamEmailHistory(page),
    refetchInterval: (query) => {
        const dispatches = query.state.data?.data || []
        const delivering = dispatches.some((dispatch) => (
            dispatch.statusCounts.retry > 0
            || (dispatch.statusCounts.pending > 0
                && (!dispatch.scheduledFor || new Date(dispatch.scheduledFor).getTime() <= Date.now()))
        ))
        if (delivering) return 10000
        const futureTimes = dispatches
            .filter((dispatch) => dispatch.statusCounts.pending > 0 && dispatch.scheduledFor)
            .map((dispatch) => new Date(dispatch.scheduledFor as string).getTime())
            .filter((time) => Number.isFinite(time) && time > Date.now())
        if (!futureTimes.length) return false
        return Math.min(Math.max(Math.min(...futureTimes) - Date.now(), 1000), 24 * 60 * 60 * 1000)
    },
})

export const useQueueTeamEmail = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: queueTeamEmail,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamEmailHistory'] }),
    })
}

export const useCancelScheduledTeamEmail = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: cancelScheduledTeamEmail,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamEmailHistory'] }),
    })
}

export const useCandidateEmailRecipients = (filters: CandidateEmailRecipientFilters) => useQuery({
    queryKey: ['candidateEmailRecipients', filters],
    queryFn: () => fetchCandidateEmailRecipients(filters),
})

export const useCandidateEmailHistory = (page = 1) => useQuery({
    queryKey: ['candidateEmailHistory', page],
    queryFn: () => fetchCandidateEmailHistory(page),
    refetchInterval: (query) => query.state.data?.data.some((dispatch) => (
        dispatch.statusCounts.pending > 0 || dispatch.statusCounts.retry > 0
    )) ? 10000 : false,
})

export const useQueueCandidateEmail = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: queueCandidateEmail,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidateEmailHistory'] }),
    })
}

export const useGetJobCandidates = (filters: CandidateListFilters = {}) => {
    return useQuery({
        queryKey: ['jobCandidates', filters],
        queryFn: () => fetchJobCandidates(filters),
    })
}

export const useCandidateFilterOptions = (
    jobSearch?: string,
    selectedJobId?: string,
    view: CandidateListFilters['view'] = 'candidates',
) => useQuery({
    queryKey: ['candidateFilterOptions', view, jobSearch || '', selectedJobId || ''],
    queryFn: () => fetchCandidateFilterOptions(jobSearch, selectedJobId, view),
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

export const useDeleteCandidateAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteCandidateAccount,
        onSuccess: (result) => {
            queryClient.removeQueries({ queryKey: ['adminCandidate', result.candidateId] })
            queryClient.removeQueries({ queryKey: ['candidateApplications', result.candidateId] })
            queryClient.invalidateQueries({ queryKey: ['jobCandidates'] })
            queryClient.invalidateQueries({ queryKey: ['candidateFilterOptions'] })
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
            queryClient.invalidateQueries({ queryKey: ['applicationWorkspace'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
        },
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
            queryClient.setQueryData<Job | undefined>(['adminJob', job._id], (current) => (
                current ? { ...current, ...job } : job
            ))
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
        },
    })
}

export const useDeleteAdminJob = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteAdminJob,
        onSuccess: (result, jobId) => {
            queryClient.setQueryData<Job | undefined>(['adminJob', jobId], (current) => (
                current
                    ? {
                        ...current,
                        status: 'Closed',
                        archivedAt: result.deletedAt,
                    }
                    : current
            ))
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
            queryClient.invalidateQueries({ queryKey: ['vacancies'] })
            queryClient.invalidateQueries({ queryKey: ['recommendations'] })
            queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
        },
    })
}

export const useRestoreAdminJob = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: restoreAdminJob,
        onSuccess: (job) => {
            queryClient.setQueryData<Job | undefined>(['adminJob', job._id], (current) => (
                current
                    ? { ...current, ...job, archivedAt: undefined }
                    : { ...job, archivedAt: undefined }
            ))
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
        },
    })
}

export const useUpdateAdminJobStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateAdminJobStatus,
        onSuccess: (job) => {
            queryClient.setQueryData<Job | undefined>(['adminJob', job._id], (current) => (
                current ? { ...current, ...job } : job
            ))
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
            queryClient.invalidateQueries({ queryKey: ['vacancies'] })
            queryClient.invalidateQueries({ queryKey: ['recommendations'] })
            queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
            queryClient.invalidateQueries({ queryKey: ['application-status', job._id] })
        },
    })
}
