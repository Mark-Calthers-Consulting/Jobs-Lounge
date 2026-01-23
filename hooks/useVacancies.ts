import { fetchVacancies, saveJob, unsaveJob } from "@/api/vacancies"
import { Job } from "@/types/types"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useVacancies = () => {
    return useQuery<Job[]>({
        queryKey: ['vacancies'],
        queryFn: fetchVacancies
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