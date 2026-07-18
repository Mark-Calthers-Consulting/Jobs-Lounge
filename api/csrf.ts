import { apiPath } from './base'
import type { ApiSuccess } from '@/types/types'
import { ApiError, readApiResponse } from './errors'

const CSRF_ERROR_CODE = 'CSRF_TOKEN_INVALID'

let cachedCsrfToken: string | null = null
let csrfTokenRequest: Promise<string> | null = null

const fetchCsrfToken = async () => {
    const res = await fetch(apiPath('/auth/csrf-token'), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<{ csrfToken: string }>>(
        res,
        'Unable to initialize request security',
    )

    if (typeof result.data?.csrfToken !== 'string') {
        throw new ApiError({
            status: 'error',
            code: 'INVALID_API_RESPONSE',
            message: 'Unable to initialize request security',
        }, res.status)
    }

    return result.data.csrfToken as string
}

const getCsrfToken = async () => {
    if (cachedCsrfToken) return cachedCsrfToken

    if (!csrfTokenRequest) {
        csrfTokenRequest = fetchCsrfToken()
            .then((token) => {
                cachedCsrfToken = token
                return token
            })
            .finally(() => {
                csrfTokenRequest = null
            })
    }

    return csrfTokenRequest
}

export const clearCsrfToken = () => {
    cachedCsrfToken = null
    csrfTokenRequest = null
}

const isCsrfFailure = async (res: Response) => {
    if (res.status !== 403) return false

    try {
        const body = await res.clone().json()
        return body.code === CSRF_ERROR_CODE
    } catch {
        return false
    }
}

export const csrfFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const executeRequest = async () => {
        const csrfToken = await getCsrfToken()
        const headers = new Headers(init.headers)
        headers.set('X-CSRF-Token', csrfToken)

        return fetch(input, {
            ...init,
            credentials: 'include',
            headers,
        })
    }

    let response = await executeRequest()

    if (await isCsrfFailure(response)) {
        clearCsrfToken()
        response = await executeRequest()
    }

    return response
}
