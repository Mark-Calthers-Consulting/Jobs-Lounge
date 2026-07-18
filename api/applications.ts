import type { ApplicationStatus } from "@/constants/enums"
import type {
    ApiSuccess,
    ApplicationRecord,
    ApplyPayload,
    Job,
    JobApplication,
    JobApplicationsResponse,
    PaginatedResponse,
} from "@/types/types"
import type { JobFormType } from "@/schemas/jobSchema"
import { csrfFetch } from "./csrf"
import { apiPath } from "./base"

export const createJob = async (job: JobFormType): Promise<Job> => {
    const res = await csrfFetch(apiPath('/jobs'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(job)
    })

    const result = await res.json() as ApiSuccess<Job> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

export const applyToJob = async (data: ApplyPayload): Promise<ApplicationRecord> => {
    const res = await csrfFetch(apiPath(`/applications/${encodeURIComponent(data.jobId)}`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })

    const result = await res.json() as ApiSuccess<ApplicationRecord> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}

export const getMyApplications = async ({ page = 1, limit = 20 } = {}): Promise<PaginatedResponse<JobApplication>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/applications/me')}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    const result = await res.json() as PaginatedResponse<JobApplication> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result
}

export const cancelApplication = async (applicationId: string): Promise<{ applicationId: string }> => {
    const res = await csrfFetch(apiPath(`/applications/${encodeURIComponent(applicationId)}`), {
        method: 'DELETE',
        credentials: 'include',
    })

    const result = await res.json() as ApiSuccess<{ applicationId: string }> & { message?: string }

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
}: GetJobApplicationsOptions): Promise<JobApplicationsResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) params.set('status', status)

    const res = await fetch(`${apiPath(`/applications/admin/${encodeURIComponent(jobId)}`)}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    const result = await res.json() as JobApplicationsResponse & { message?: string }

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
}): Promise<ApplicationRecord> => {
    const res = await csrfFetch(apiPath(`/applications/admin/${encodeURIComponent(applicationId)}`), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
    })

    const result = await res.json() as ApiSuccess<ApplicationRecord> & { message?: string }

    if (!res.ok) {
        throw new Error(result.message || 'Request failed');
    }

    return result.data
}
