import { apiPath } from './base'
import { csrfFetch } from './csrf'
import { readApiResponse } from './errors'
import type { ApiSuccess } from '@/types/types'

export type ContactPayload = {
    name: string
    email: string
    telephone?: string
    subject: string
    message: string
}

export const submitContactMessage = async (data: ContactPayload) => {
    const res = await csrfFetch(apiPath('/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await readApiResponse<ApiSuccess<{ accepted: true }>>(
        res,
        'Unable to send your message',
    )
    return result.data
}
