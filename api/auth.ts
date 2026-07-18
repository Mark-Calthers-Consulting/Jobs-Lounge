import { LoginPayload, RegisterPayload } from "@/types/types";
import { clearCsrfToken, csrfFetch } from "./csrf";
import { apiPath } from "./base";



export const loginUser = async (data: LoginPayload) => {
    const res = await csrfFetch(apiPath('/auth/login'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    clearCsrfToken()
    return result.data
}

export const logoutUser = async () => {
    const res = await csrfFetch(apiPath('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    clearCsrfToken()
    return result.data
}

export const registerUser = async (data: RegisterPayload) => {
    const res = await csrfFetch(apiPath('/auth/register'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    const result = await res.json()
    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }
    clearCsrfToken()
    return result.data
}
