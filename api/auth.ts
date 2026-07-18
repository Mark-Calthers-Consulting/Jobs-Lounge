import type { ApiSuccess, AuthUser, LoginPayload, RegisterPayload } from "@/types/types";
import { clearCsrfToken, csrfFetch } from "./csrf";
import { apiPath } from "./base";



export const loginUser = async (data: LoginPayload): Promise<AuthUser> => {
    const res = await csrfFetch(apiPath('/auth/login'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })

    const result = await res.json() as ApiSuccess<AuthUser> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    clearCsrfToken()
    return result.data
}

export const logoutUser = async (): Promise<null> => {
    const res = await csrfFetch(apiPath('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
    })

    const result = await res.json() as ApiSuccess<null> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

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
    const result = await res.json() as ApiSuccess<AuthUser> & { message?: string }
    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }
    clearCsrfToken()
    return result.data
}
