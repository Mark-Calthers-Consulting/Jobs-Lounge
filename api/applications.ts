import type {
    ApiSuccess,
    ApplicationSubmission,
    ApplyPayload,
    Job,
    JobApplication,
    PaginatedResponse,
} from "@/types/types"
import type { JobFormType } from "@/schemas/jobSchema"
import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import { readApiResponse } from './errors'

export const createJob = async (job: JobFormType): Promise<Job> => {
    const res = await csrfFetch(apiPath('/jobs'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(job)
    })

    const result = await readApiResponse<ApiSuccess<Job>>(res, 'Unable to create job')

    return result.data
}

export const applyToJob = async (data: ApplyPayload): Promise<ApplicationSubmission> => {
    const { jobId, ...application } = data
    const res = await csrfFetch(apiPath(`/applications/${encodeURIComponent(jobId)}`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(application)
    })

    const result = await readApiResponse<ApiSuccess<ApplicationSubmission>>(res, 'Unable to apply for job')

    return result.data
}

export const getMyApplications = async ({ page = 1, limit = 20 } = {}): Promise<PaginatedResponse<JobApplication>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/applications/me')}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })

    const result = await readApiResponse<PaginatedResponse<JobApplication>>(
        res,
        'Unable to load applications',
    )

    return result
}

export const cancelApplication = async (applicationId: string): Promise<{ applicationId: string }> => {
    const res = await csrfFetch(apiPath(`/applications/${encodeURIComponent(applicationId)}`), {
        method: 'DELETE',
        credentials: 'include',
    })

    const result = await readApiResponse<ApiSuccess<{ applicationId: string }>>(
        res,
        'Unable to cancel application',
    )

    return result.data
}
