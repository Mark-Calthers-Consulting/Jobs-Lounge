import { LoginPayload, RegisterPayload } from "@/types/types";

export const fetchUser = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
    })

     if (res.status === 401) return null
     
    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

export const loginUser = async (data: LoginPayload) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
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

    return result.data
}

export const registerUser = async (data: RegisterPayload) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
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
    return result.data
}