import { ApplicationStatus, applyPayload } from "@/types/types"
import { csrfFetch } from "./csrf"
import { apiPath } from "./base"

export const createJob = async (job: Record<string, unknown>) => {
    const res = await csrfFetch(apiPath('/jobs'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(job)
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

export const applyToJob = async (data: applyPayload) => {
    const res = await csrfFetch(apiPath(`/applications/${encodeURIComponent(data.jobId)}`), {
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

export const getMyApplications = async ({ page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/applications/me')}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result
}

export const cancelApplication = async (applicationId: string) => {
    const res = await csrfFetch(apiPath(`/applications/${encodeURIComponent(applicationId)}`), {
        method: 'DELETE',
        credentials: 'include',
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}



type GetJobApplicationsOptions = {
    jobId: string
    page?: number
    limit?: number
    status?: ApplicationStatus
}

export const getAllJobApplications = async ({
    jobId,
    page = 1,
    limit = 20,
    status,
}: GetJobApplicationsOptions) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) params.set('status', status)

    const res = await fetch(`${apiPath(`/applications/admin/${encodeURIComponent(jobId)}`)}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result
}

export const updateApplicationStatus = async ({
    applicationId,
    status,
}: {
    applicationId: string
    status: ApplicationStatus
}) => {
    const res = await csrfFetch(apiPath(`/applications/admin/${encodeURIComponent(applicationId)}`), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}
