import {
    acceptStaffInvitation,
    confirmEmailVerification,
    confirmPasswordReset,
    loginUser,
    logoutUser,
    registerUser,
    requestEmailVerification,
    requestPasswordReset,
} from "@/api/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { User } from '@/types/types'

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

export const usePasswordResetRequest = () => useMutation({
    mutationFn: requestPasswordReset,
})

export const usePasswordResetConfirmation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: confirmPasswordReset,
        onSuccess: () => {
            queryClient.removeQueries()
            queryClient.setQueryData(['me'], null)
        },
    })
}

export const useEmailVerificationRequest = () => useMutation({
    mutationFn: requestEmailVerification,
})

export const useEmailVerificationConfirmation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: confirmEmailVerification,
        onSuccess: (result) => {
            queryClient.setQueryData<User | null>(['me'], (user) => (
                user
                    ? {
                        ...user,
                        emailVerified: true,
                        emailVerifiedAt: result.emailVerifiedAt,
                    }
                    : user
            ))
        },
    })
}

export const useStaffInvitationConfirmation = () => useMutation({
    mutationFn: acceptStaffInvitation,
})
