import type { ApiSuccess, AuthUser, LoginPayload, RegisterPayload } from "@/types/types";
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
