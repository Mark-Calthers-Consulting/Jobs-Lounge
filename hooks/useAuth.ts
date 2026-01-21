import { fetchUser, loginUser, registerUser } from "@/api/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useUser = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: fetchUser
    })
}

export const useLogin = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: loginUser,
        // onSuccess: () => {
        //     qc.invalidateQueries({ queryKey: ["me"] })
        // },
    })
}

export const useRegister = () => {
    return useMutation({
        mutationFn: registerUser
    })
}