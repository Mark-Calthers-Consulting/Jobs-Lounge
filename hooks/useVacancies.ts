import { checkApplicationStatus, fetchVacancies, getRecommendedJobs, saveJob, unsaveJob } from "@/api/vacancies"
import { applyPayload, Job } from "@/types/types"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useVacancies = (searchTerm: String) => {
    return useQuery<Job[]>({
        queryKey: ['vacancies', searchTerm],
        queryFn: () => fetchVacancies(searchTerm)
    })
}

export const useSaveJob = () => {
    return useMutation({
        mutationFn: saveJob
    })
}

export const useUnsaveJob = () => {
    return useMutation({
        mutationFn: unsaveJob
    })
}

export const useCheckApplicationStatus = (jobId: String) => {
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