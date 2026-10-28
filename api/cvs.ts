import { csrfFetch } from './csrf'
import { apiPath } from './base'
import { readApiResponse } from './errors'
import type { ApiSuccess } from '@/types/types'

export type CandidateCv = {
  id: string
  name: string
  originalName: string
  mimeType: string
  bytes: number
  createdAt: string
}

export const getMyCvs = async (): Promise<{ items: CandidateCv[]; uploadEnabled: boolean }> => {
  const response = await fetch(apiPath('/users/me/cvs'), { credentials: 'include', cache: 'no-store' })
  const result = await readApiResponse<ApiSuccess<CandidateCv[]> & { uploadEnabled: boolean }>(response, 'Unable to load CVs')
  return { items: result.data, uploadEnabled: result.uploadEnabled === true }
}

const uploadInChunks = async ({ file, name, replaceId }: { file: File; name?: string; replaceId?: string }): Promise<CandidateCv> => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = extension === 'pdf' ? 'application/pdf'
    : extension === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : file.type
  const started = await csrfFetch(apiPath('/users/me/cvs/uploads'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: replaceId ? 'replace' : 'upload',
      ...(replaceId ? { cvId: replaceId } : { name }),
      originalName: file.name, mimeType, bytes: file.size,
    }),
    signal: AbortSignal.timeout(20000),
  })
  const { id, chunkBytes } = (await readApiResponse<ApiSuccess<{ id: string; chunkBytes: number }>>(
    started, 'Unable to start CV upload',
  )).data
  try {
    const count = Math.ceil(file.size / chunkBytes)
    for (let offset = 0; offset < count; offset += 4) {
      await Promise.all(Array.from({ length: Math.min(4, count - offset) }, async (_, position) => {
        const index = offset + position
        const response = await csrfFetch(apiPath(`/users/me/cvs/uploads/${encodeURIComponent(id)}/chunks/${index}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: file.slice(index * chunkBytes, Math.min((index + 1) * chunkBytes, file.size)),
          signal: AbortSignal.timeout(30000),
        })
        await readApiResponse(response, 'Unable to send CV file')
      }))
    }
    const completed = await csrfFetch(apiPath(`/users/me/cvs/uploads/${encodeURIComponent(id)}/complete`), {
      method: 'POST', signal: AbortSignal.timeout(90000),
    })
    return (await readApiResponse<ApiSuccess<CandidateCv>>(completed, 'Unable to save CV')).data
  } catch (error) {
    await csrfFetch(apiPath(`/users/me/cvs/uploads/${encodeURIComponent(id)}`), {
      method: 'DELETE', signal: AbortSignal.timeout(10000),
    }).catch(() => {})
    throw error
  }
}

export const uploadCv = async ({ file, name }: { file: File; name: string }): Promise<CandidateCv> =>
  uploadInChunks({ file, name })

export const replaceCv = async ({ id, file }: { id: string; file: File }): Promise<CandidateCv> =>
  uploadInChunks({ file, replaceId: id })

export const renameCv = async ({ id, name }: { id: string; name: string }): Promise<CandidateCv> => {
  const response = await csrfFetch(apiPath(`/users/me/cvs/${encodeURIComponent(id)}`), {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
  })
  return (await readApiResponse<ApiSuccess<CandidateCv>>(response, 'Unable to rename CV')).data
}

export const removeCv = async (id: string): Promise<void> => {
  const response = await csrfFetch(apiPath(`/users/me/cvs/${encodeURIComponent(id)}`), { method: 'DELETE' })
  await readApiResponse(response, 'Unable to remove CV')
}

export const myCvUrl = (id: string) => apiPath(`/users/me/cvs/${encodeURIComponent(id)}/content`)
export const applicationCvUrl = (id: string) => apiPath(`/admin/applications/${encodeURIComponent(id)}/cv`)
export const candidateCvUrl = (candidateId: string, cvId: string) => apiPath(`/admin/candidates/${encodeURIComponent(candidateId)}/cvs/${encodeURIComponent(cvId)}/content`)

export const getCandidateCvs = async (candidateId: string): Promise<CandidateCv[]> => {
  const response = await fetch(apiPath(`/admin/candidates/${encodeURIComponent(candidateId)}/cvs`), {
    credentials: 'include', cache: 'no-store',
  })
  return (await readApiResponse<ApiSuccess<CandidateCv[]>>(response, 'Unable to load candidate CVs')).data
}
