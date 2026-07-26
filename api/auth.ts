import type {
    ApiSuccess,
    AuthUser,
    EmailVerificationConfirmPayload,
    EmailVerificationResult,
    LoginPayload,
    PasswordResetConfirmPayload,
    PasswordResetRequestPayload,
    RegisterPayload,
} from "@/types/types";
import { clearCsrfToken, csrfFetch } from "./csrf";
import { apiPath } from "./base";
import { readApiResponse } from './errors';



export const loginUser = async (data: LoginPayload): Promise<AuthUser> => {
    const res = await csrfFetch(apiPath('/auth/login'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })

    const result = await readApiResponse<ApiSuccess<AuthUser>>(res, 'Unable to sign in')

    clearCsrfToken()
    return result.data
}

export const logoutUser = async (): Promise<null> => {
    const res = await csrfFetch(apiPath('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
    })

    const result = await readApiResponse<ApiSuccess<null>>(res, 'Unable to sign out')

    clearCsrfToken()
    return result.data
}

export const registerUser = async (data: RegisterPayload): Promise<AuthUser> => {
    const res = await csrfFetch(apiPath('/auth/register'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    const result = await readApiResponse<ApiSuccess<AuthUser>>(res, 'Unable to create account')
    clearCsrfToken()
    return result.data
}

export const requestPasswordReset = async (
    data: PasswordResetRequestPayload,
): Promise<string> => {
    const res = await csrfFetch(apiPath('/auth/password-reset/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await readApiResponse<ApiSuccess<null>>(
        res,
        'Unable to request password reset instructions',
    )
    return result.message
        || 'If an account exists for that email, we’ll send password reset instructions.'
}

export const confirmPasswordReset = async (
    data: PasswordResetConfirmPayload,
): Promise<string> => {
    const res = await csrfFetch(apiPath('/auth/password-reset/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await readApiResponse<ApiSuccess<null>>(
        res,
        'Unable to reset password',
    )
    clearCsrfToken()
    return result.message || 'Password changed. Sign in with your new password.'
}

export const requestEmailVerification = async (): Promise<string> => {
    const res = await csrfFetch(apiPath('/auth/email-verification/request'), {
        method: 'POST',
    })
    const result = await readApiResponse<ApiSuccess<null>>(
        res,
        'Unable to send verification email',
    )
    return result.message || 'If your email still needs verification, we’ll send a new link.'
}

export const confirmEmailVerification = async (
    data: EmailVerificationConfirmPayload,
): Promise<EmailVerificationResult> => {
    const res = await csrfFetch(apiPath('/auth/email-verification/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await readApiResponse<ApiSuccess<EmailVerificationResult>>(
        res,
        'Unable to verify email',
    )
    return result.data
}
