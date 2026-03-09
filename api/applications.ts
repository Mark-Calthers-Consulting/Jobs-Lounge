import { applyPayload } from "@/types/types"
import { headers } from "next/headers"

export const applyToJob = async (data: applyPayload) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications/:jobId`, {
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

export const getMyApplications = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications/me`, {
        method: 'GET',
        credentials: 'include',
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

export const cancelApplication = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/:applicationId`, {
        method: 'DELETE',
        credentials: 'include',
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}



export const getJobApplications = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications/admin/:jobId`, {
        method: 'GET',
        credentials: 'include',
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

// export const updateApplicationStatus = async (data) => {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications/me`, {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         credentials: 'include',
//         body: JSON.stringify(data)
//     })

//     const result = await res.json()

//     if (!res.ok) {
//         throw new Error(result.message || 'Request failed');
//     }

//     return result.data
// }