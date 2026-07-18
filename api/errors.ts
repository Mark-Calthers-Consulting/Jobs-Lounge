export type ApiErrorPayload = {
    status: 'error'
    code: string
    message: string
    details?: unknown
    requestId?: string
}

export class ApiError extends Error {
    readonly code: string
    readonly details?: unknown
    readonly requestId?: string
    readonly statusCode: number

    constructor(payload: ApiErrorPayload, statusCode: number) {
        super(
            statusCode >= 500 && payload.requestId
                ? `${payload.message} Reference: ${payload.requestId}`
                : payload.message,
        )
        this.name = 'ApiError'
        this.code = payload.code
        this.details = payload.details
        this.requestId = payload.requestId
        this.statusCode = statusCode
    }
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
)

const responseBody = async (response: Response): Promise<unknown> => {
    try {
        return await response.json()
    } catch {
        return null
    }
}

export const readApiResponse = async <T>(
    response: Response,
    fallbackMessage: string,
): Promise<T> => {
    const body = await responseBody(response)

    if (!response.ok) {
        const payload: ApiErrorPayload = {
            status: 'error',
            code: isRecord(body) && typeof body.code === 'string'
                ? body.code
                : `HTTP_${response.status}`,
            message: isRecord(body) && typeof body.message === 'string'
                ? body.message
                : fallbackMessage,
            ...(isRecord(body) && 'details' in body ? { details: body.details } : {}),
            ...(isRecord(body) && typeof body.requestId === 'string'
                ? { requestId: body.requestId }
                : {}),
        }
        throw new ApiError(payload, response.status)
    }

    if (body === null) {
        throw new ApiError({
            status: 'error',
            code: 'INVALID_API_RESPONSE',
            message: fallbackMessage,
        }, response.status)
    }

    return body as T
}
