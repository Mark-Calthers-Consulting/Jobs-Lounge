import { loginUser, logoutUser, registerUser } from "@/api/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useLogin = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: loginUser,
        onSuccess: () => queryClient.removeQueries({ queryKey: ['me'] }),
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.removeQueries()
            queryClient.setQueryData(['me'], null)
        },
    })
}

export const useRegister = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: registerUser,
        onSuccess: () => queryClient.removeQueries({ queryKey: ['me'] }),
    })
}
