import {
    checkApplicationStatus,
    fetchJobFilterOptions,
    fetchVacancies,
    getRecommendedJobs,
    saveJob,
    unsaveJob,
} from "@/api/vacancies"
import { Job, PaginatedResponse, VacancyFilters } from "@/types/types"
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"

export const useVacancies = (
    filtersOrSearch: VacancyFilters | string = {},
    legacyPage = 1,
    legacyLimit = 20,
) => {
    const filters: VacancyFilters = typeof filtersOrSearch === 'string'
        ? {
            search: filtersOrSearch || undefined,
            page: legacyPage,
            limit: legacyLimit,
        }
        : filtersOrSearch

    return useQuery<PaginatedResponse<Job>>({
        queryKey: ['vacancies', filters],
        queryFn: ({ signal }) => fetchVacancies(filters, signal),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    })
}

export const useJobFilterOptions = () => useQuery({
    queryKey: ['vacancyFilterOptions'],
    queryFn: ({ signal }) => fetchJobFilterOptions(signal),
    staleTime: 5 * 60_000,
})

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

export const useCheckApplicationStatus = (jobId: string, enabled = true) => {
    return useQuery({
        queryKey: ["application-status", jobId],
        queryFn: () => checkApplicationStatus(jobId),
        enabled,
    })
}

export const useRecommendedJobs = (enabled = true) => {
    return useQuery({
        queryKey: ['recommendations'],
        queryFn: getRecommendedJobs,
        enabled,
    })
}
