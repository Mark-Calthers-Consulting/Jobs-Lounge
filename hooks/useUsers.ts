import { editUserDetails, fetchUser, getSavedJobs, updateNotificationPreferences } from "@/api/users"
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
        onSuccess: (user) => queryClient.setQueryData(['me'], user),
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
