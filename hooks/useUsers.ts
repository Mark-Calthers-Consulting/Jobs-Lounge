import { editUserDetails, fetchUser, getSavedJobs, updateNotificationPreferences, updateStaffProfile } from "@/api/users"
import type { User } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type Options = {
    enabled?: boolean;
    page?: number;
    limit?: number;
};

export const useUser = () => {
    return useQuery<User | null>({
        queryKey: ['me'],
        queryFn: fetchUser,
        staleTime: 30_000,
        retry: 1,
    })
}

export const useGetSavedJobs = (options: Options = {}) => {
    const { enabled = true, page = 1, limit = 20 } = options
    return useQuery({
        queryKey: ['savedJobs', page, limit],
        queryFn: () => getSavedJobs(page, limit),
        enabled,
    })
}

export const useEditUserDetails = ()=> {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: editUserDetails,
        onSuccess: (user) => {
            queryClient.setQueryData<User | null>(['me'], (current) => (
                user ? { ...current, ...user } : current
            ))
            void queryClient.invalidateQueries({ queryKey: ['candidateOnboarding'] })
            void queryClient.invalidateQueries({ queryKey: ['recommendations'] })
        },
    })
 }

export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateNotificationPreferences,
        onSuccess: (preferences) => queryClient.setQueryData<User | null>(['me'], (user) => (
            user ? { ...user, notificationPreferences: preferences } : user
        )),
    })
}

export const useUpdateStaffProfile = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateStaffProfile,
        onSuccess: (user) => queryClient.setQueryData<User | null>(['me'], (current) => (
            current ? { ...current, ...user } : user
        )),
    })
}
