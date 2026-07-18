const CSRF_ERROR_CODE = 'CSRF_TOKEN_INVALID'

let cachedCsrfToken: string | null = null
let csrfTokenRequest: Promise<string> | null = null

const fetchCsrfToken = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await res.json()

    if (!res.ok || typeof result.data?.csrfToken !== 'string') {
        throw new Error(result.message || 'Unable to initialize request security')
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
