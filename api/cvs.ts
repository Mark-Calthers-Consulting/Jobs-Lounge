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

export const uploadCv = async ({ file, name }: { file: File; name: string }): Promise<CandidateCv> => {
  const body = new FormData()
  body.set('file', file)
  body.set('name', name)
  const response = await csrfFetch(apiPath('/users/me/cvs'), { method: 'POST', body })
  return (await readApiResponse<ApiSuccess<CandidateCv>>(response, 'Unable to upload CV')).data
}

export const replaceCv = async ({ id, file }: { id: string; file: File }): Promise<CandidateCv> => {
  const body = new FormData()
  body.set('file', file)
  const response = await csrfFetch(apiPath(`/users/me/cvs/${encodeURIComponent(id)}/replace`), {
    method: 'POST', body,
  })
  return (await readApiResponse<ApiSuccess<CandidateCv>>(response, 'Unable to replace CV')).data
}

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
