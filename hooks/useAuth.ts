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
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['me'] })
            queryClient.removeQueries({ queryKey: ['candidateOnboarding'] })
            queryClient.removeQueries({ queryKey: ['recommendations'] })
        },
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
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['me'] })
            queryClient.removeQueries({ queryKey: ['candidateOnboarding'] })
            queryClient.removeQueries({ queryKey: ['recommendations'] })
        },
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
            void queryClient.invalidateQueries({ queryKey: ['candidateOnboarding'] })
            void queryClient.invalidateQueries({ queryKey: ['recommendations'] })
        },
    })
}

export const useStaffInvitationConfirmation = () => useMutation({
    mutationFn: acceptStaffInvitation,
})
