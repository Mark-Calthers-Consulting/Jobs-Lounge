import { checkApplicationStatus, fetchVacancies, getRecommendedJobs, saveJob, unsaveJob } from "@/api/vacancies"
import { Job, PaginatedResponse } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useVacancies = (searchTerm: string, page = 1, limit = 20) => {
    return useQuery<PaginatedResponse<Job>>({
        queryKey: ['vacancies', searchTerm, page, limit],
        queryFn: ({ signal }) => fetchVacancies(searchTerm, page, limit, signal),
        staleTime: 30_000,
    })
}

export const useSaveJob = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: saveJob,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
    })
}

export const useUnsaveJob = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: unsaveJob,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
    })
}

export const useCheckApplicationStatus = (jobId: string) => {
    return useQuery({
        queryKey: ["application-status", jobId],
        queryFn: () => checkApplicationStatus(jobId)
    })
}

export const useRecommendedJobs = () => {
    return useQuery({
        queryKey: ['recommendations'],
        queryFn: getRecommendedJobs
    })
}
