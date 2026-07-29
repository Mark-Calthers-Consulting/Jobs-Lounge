import type {
  ApiSuccess,
  ApplicationActivity,
  ApplicationDetail,
  ApplicationFilterOptions,
  ApplicationJobDirectoryFilters,
  ApplicationJobDirectoryResponse,
  ApplicationJobSummary,
  ApplicationListResponse,
  ApplicationOverview,
  ApplicationWorkspaceFilters,
} from '@/types/types'
import type { ApplicationStatus } from '@/constants/enums'
import { apiPath } from './base'
import { csrfFetch } from './csrf'
import { readApiResponse } from './errors'

const addListFilters = (params: URLSearchParams, filters: ApplicationWorkspaceFilters) => {
  if (filters.cursor) params.set('cursor', filters.cursor)
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.jobId) params.set('jobId', filters.jobId)
  if (filters.applicantId) params.set('applicantId', filters.applicantId)
  filters.status?.forEach((status) => params.append('status', status))
  if (filters.priority !== undefined) params.set('priority', String(filters.priority))
  if (filters.education) params.set('education', filters.education)
  if (filters.nyscStatus) params.set('nyscStatus', filters.nyscStatus)
  if (filters.experienceMin !== undefined) params.set('experienceMin', String(filters.experienceMin))
  if (filters.experienceMax !== undefined) params.set('experienceMax', String(filters.experienceMax))
  if (filters.profileCompleted !== undefined) params.set('profileCompleted', String(filters.profileCompleted))
  if (filters.appliedFrom) params.set('appliedFrom', filters.appliedFrom)
  if (filters.appliedTo) params.set('appliedTo', filters.appliedTo)
  if (filters.hasCv !== undefined) params.set('hasCv', String(filters.hasCv))
  if (filters.hasCoverLetter !== undefined) params.set('hasCoverLetter', String(filters.hasCoverLetter))
  if (filters.sort) params.set('sort', filters.sort)
}

const get = async <T>(path: string, fallback: string): Promise<T> => {
  const response = await fetch(apiPath(path), {
    credentials: 'include',
    cache: 'no-store',
  })
  return readApiResponse<T>(response, fallback)
}

export const fetchApplicationsOverview = async () => {
  const result = await get<ApiSuccess<ApplicationOverview>>(
    '/admin/applications/overview',
    'Unable to load the applications overview',
  )
  return result.data
}

export const fetchWorkspaceApplications = async (
  filters: ApplicationWorkspaceFilters = {},
): Promise<ApplicationListResponse> => {
  const params = new URLSearchParams()
  addListFilters(params, filters)
  return get<ApplicationListResponse>(
    `/admin/applications?${params}`,
    'Unable to load applications',
  )
}

export const fetchApplicationJobs = async (
  filters: ApplicationJobDirectoryFilters = {},
): Promise<ApplicationJobDirectoryResponse> => {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 20),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.view) params.set('view', filters.view)
  if (filters.sort) params.set('sort', filters.sort)
  return get<ApplicationJobDirectoryResponse>(
    `/admin/applications/jobs?${params}`,
    'Unable to load vacancy workloads',
  )
}

export const fetchApplicationJobSummary = async (
  jobId: string,
  filters: Omit<ApplicationWorkspaceFilters, 'jobId' | 'cursor' | 'limit' | 'status' | 'sort'> = {},
) => {
  const params = new URLSearchParams()
  addListFilters(params, filters)
  const result = await get<ApiSuccess<ApplicationJobSummary>>(
    `/admin/applications/jobs/${encodeURIComponent(jobId)}/summary?${params}`,
    'Unable to load the vacancy summary',
  )
  return result.data
}

export const fetchApplicationDetail = async (applicationId: string) => {
  const result = await get<ApiSuccess<ApplicationDetail>>(
    `/admin/applications/${encodeURIComponent(applicationId)}`,
    'Unable to load application details',
  )
  return result.data
}

export const fetchApplicationActivity = async ({
  applicationId,
  cursor,
}: {
  applicationId: string
  cursor?: string
}) => {
  const params = new URLSearchParams({ limit: '20' })
  if (cursor) params.set('cursor', cursor)
  return get<{
    status: 'success'
    count: number
    data: ApplicationActivity[]
    pageInfo: { nextCursor: string | null; hasNextPage: boolean }
  }>(
    `/admin/applications/${encodeURIComponent(applicationId)}/activity?${params}`,
    'Unable to load application activity',
  )
}

export const fetchApplicationFilterOptions = async ({
  candidateSearch,
  jobSearch,
  selectedCandidateId,
  selectedJobId,
}: {
  candidateSearch?: string
  jobSearch?: string
  selectedCandidateId?: string
  selectedJobId?: string
} = {}) => {
  const params = new URLSearchParams()
  if (candidateSearch) params.set('candidateSearch', candidateSearch)
  if (jobSearch) params.set('jobSearch', jobSearch)
  if (selectedCandidateId) params.set('selectedCandidateId', selectedCandidateId)
  if (selectedJobId) params.set('selectedJobId', selectedJobId)
  const result = await get<ApiSuccess<ApplicationFilterOptions>>(
    `/admin/applications/filter-options?${params}`,
    'Unable to load application filters',
  )
  return result.data
}

export const updateApplicationWorkflow = async ({
  applicationId,
  expectedVersion,
  status,
  priority,
  undo,
}: {
  applicationId: string
  expectedVersion: number
  status?: ApplicationStatus
  priority?: boolean
  undo?: boolean
}) => {
  const response = await csrfFetch(
    apiPath(`/admin/applications/${encodeURIComponent(applicationId)}`),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedVersion, status, priority, undo }),
    },
  )
  const result = await readApiResponse<ApiSuccess<{ workflowVersion: number }>>(
    response,
    'Unable to update this application',
  )
  return result.data
}

export const addApplicationNote = async ({
  applicationId,
  note,
}: {
  applicationId: string
  note: string
}) => {
  const response = await csrfFetch(
    apiPath(`/admin/applications/${encodeURIComponent(applicationId)}/notes`),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    },
  )
  const result = await readApiResponse<ApiSuccess<ApplicationActivity>>(
    response,
    'Unable to save this note',
  )
  return result.data
}

export const bulkUpdateApplications = async ({
  applications,
  status,
  priority,
}: {
  applications: Array<{ applicationId: string; workflowVersion: number }>
  status?: ApplicationStatus
  priority?: boolean
}) => {
  const response = await csrfFetch(apiPath('/admin/applications/bulk'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applications, status, priority }),
  })
  const result = await readApiResponse<ApiSuccess<{ updated: number }>>(
    response,
    'Unable to update the selected applications',
  )
  return result.data
}
