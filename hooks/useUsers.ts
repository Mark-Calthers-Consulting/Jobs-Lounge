import { fetchUser } from "@/api/auth"
import { getSavedJobs } from "@/api/users"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useUser = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: fetchUser
    })
}

export const useGetSavedJobs = () => {
    return useQuery({
        queryKey: ['savedJobs'],
        queryFn: getSavedJobs
    })
}