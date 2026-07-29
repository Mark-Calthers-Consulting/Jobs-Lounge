import type { ReadonlyURLSearchParams } from 'next/navigation'
import type { ApplicationStatus } from '@/constants/enums'
import type { ApplicationWorkspaceFilters } from '@/types/types'

const booleanValue = (value: string | null) => (
  value === 'true' ? true : value === 'false' ? false : undefined
)
const numberValue = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const applicationFiltersFromUrl = (
  params: ReadonlyURLSearchParams,
  fixedJobId?: string,
): ApplicationWorkspaceFilters => ({
  jobId: fixedJobId || params.get('jobId') || undefined,
  applicantId: params.get('applicantId') || undefined,
  status: params.getAll('status') as ApplicationStatus[],
  priority: booleanValue(params.get('priority')),
  education: params.get('education') || undefined,
  nyscStatus: (params.get('nyscStatus') as ApplicationWorkspaceFilters['nyscStatus']) || undefined,
  experienceMin: numberValue(params.get('experienceMin')),
  experienceMax: numberValue(params.get('experienceMax')),
  profileCompleted: booleanValue(params.get('profileCompleted')),
  appliedFrom: params.get('appliedFrom') || undefined,
  appliedTo: params.get('appliedTo') || undefined,
  hasCv: booleanValue(params.get('hasCv')),
  hasCoverLetter: booleanValue(params.get('hasCoverLetter')),
  sort: (params.get('sort') as ApplicationWorkspaceFilters['sort']) || 'newest',
  cursor: params.get('cursor') || undefined,
})
