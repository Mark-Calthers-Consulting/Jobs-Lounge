import { applyToJob, cancelApplication, createJob, getMyApplications } from "@/api/applications";
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
        },
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
            queryClient.invalidateQueries({ queryKey: ['recommendations'] })
        }
    })
}
