import { applyToJob, cancelApplication, createJob, getAllJobApplications, getMyApplications, updateApplicationStatus } from "@/api/applications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const useCreatejob = () => {
    return useMutation({
        mutationFn: createJob
    })
}

export const useApplyToJob = () => {
    return useMutation({
        mutationFn: applyToJob
    })
}

export const useGetMyApplications = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['getPersonalApplications', page, limit],
        queryFn: () => getMyApplications({ page, limit })
    })
}

export const useCancelApplication = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: cancelApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getPersonalApplications'] })
            queryClient.invalidateQueries({ queryKey: ['me'] })
        }
    })
}

export const useGetAllApplications = (jobId: string, page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['getAllApplications', jobId, page, limit],
        queryFn: () => getAllJobApplications({ jobId, page, limit }),
        enabled: Boolean(jobId)
    })
}

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateApplicationStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getAllApplications'] })
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
            queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
            queryClient.invalidateQueries({ queryKey: ['adminJob'] })
            queryClient.invalidateQueries({ queryKey: ['adminCandidate'] })
            queryClient.invalidateQueries({ queryKey: ['candidateApplications'] })
        }
    })
}
