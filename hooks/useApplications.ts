import { applyToJob, cancelApplication, createJob, getMyApplications, getWeeklyApplicationLimit } from "@/api/applications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const useCreatejob = () => {
    return useMutation({
        mutationFn: createJob
    })
}

export const useApplyToJob = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: applyToJob,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['recommendations'] })
            void queryClient.invalidateQueries({ queryKey: ['me'] })
            void queryClient.invalidateQueries({ queryKey: ['weeklyApplicationLimit'] })
        },
    })
}

export const useWeeklyApplicationLimit = (enabled = true) => useQuery({
    queryKey: ['weeklyApplicationLimit'],
    queryFn: getWeeklyApplicationLimit,
    enabled,
    staleTime: 15_000,
    refetchInterval: (query) => query.state.data?.remaining === 0 ? 60_000 : false,
})

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
            queryClient.invalidateQueries({ queryKey: ['recommendations'] })
        }
    })
}
