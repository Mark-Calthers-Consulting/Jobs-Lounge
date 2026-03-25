import { loginUser, logoutUser, registerUser } from "@/api/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useLogin = () => {
    // const qc = useQueryClient()
    return useMutation({
        mutationFn: loginUser,
        // onSuccess: () => {
        //     qc.invalidateQueries({ queryKey: ["me"] })
        // },
    })
}

export const useLogout = () => {
    return useMutation({
        mutationFn: logoutUser
    })
}

export const useRegister = () => {
    return useMutation({
        mutationFn: registerUser
    })
}