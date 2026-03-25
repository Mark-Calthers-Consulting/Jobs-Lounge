import { editUserDetails, fetchUser, getSavedJobs } from "@/api/users"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type Options = {
    enabled?: boolean;
};

export const useUser = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: fetchUser
    })
}

export const useGetSavedJobs = (options: Options) => {
    return useQuery({
        queryKey: ['savedJobs'],
        queryFn: getSavedJobs,
        enabled: options?.enabled
    })
}

export const useEditUserDetails = ()=> {
    return useMutation({
        mutationFn: editUserDetails
    })
 }