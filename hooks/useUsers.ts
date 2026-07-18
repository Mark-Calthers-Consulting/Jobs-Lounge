import { editUserDetails, fetchUser, getSavedJobs } from "@/api/users"
import type { User } from "@/types/types"
import { useMutation, useQuery } from "@tanstack/react-query"

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
    return useMutation({
        mutationFn: editUserDetails
    })
 }
