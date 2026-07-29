'use client'

import type { ApplicationStatus } from '@/constants/enums'
import type { AdminApplication, ApplicationStageTotals } from '@/types/types'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { formatDateInTimeZone } from '@/utils/dateTime'

export const STAGES: Array<{ value: ApplicationStatus; label: string }> = [
  { value: 'pending', label: 'New' },
  { value: 'reviewed', label: 'In review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
]

export const stageLabel = (status: ApplicationStatus) => (
  STAGES.find((stage) => stage.value === status)?.label || status
)

export const stageTone: Record<ApplicationStatus, string> = {
  pending: 'bg-blue-50 text-blue-800 border-blue-200',
  reviewed: 'bg-amber-50 text-amber-900 border-amber-200',
  shortlisted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-50 text-red-800 border-red-200',
}

export const formatDate = (value?: string, timeZone = 'Africa/Lagos') => value
  ? formatDateInTimeZone(value, timeZone, { dateStyle: 'medium' })
  : 'Not available'

export const StageCounts = ({
  totals,
  compact = false,
}: {
  totals: ApplicationStageTotals
  compact?: boolean
}) => (
  <div className={`grid gap-3 ${compact ? 'grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
    {STAGES.map((stage) => (
      <div key={stage.value} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-500">{stage.label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-950">{totals[stage.value] ?? 0}</p>
      </div>
    ))}
  </div>
)

export const StatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${stageTone[status]}`}>
    {stageLabel(status)}
  </span>
)

export const ApplicationCard = ({
  application,
  selected,
  onSelect,
  selectable,
  checked,
  onChecked,
}: {
  application: AdminApplication
  selected?: boolean
  onSelect: () => void
  selectable?: boolean
  checked?: boolean
  onChecked?: (checked: boolean) => void
}) => {
  const { timeZone } = usePlatformSettings()
  return (
  <article className={`rounded-xl border bg-white p-4 transition-colors ${
    selected ? 'border-blue-700 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
  }`}>
    <div className="flex items-start gap-3">
      {selectable ? (
        <input
          type="checkbox"
          aria-label={`Select ${application.name}`}
          checked={checked}
          onChange={(event) => onChecked?.(event.target.checked)}
          className="mt-1 size-4 accent-blue-800"
        />
      ) : null}
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-slate-950">{application.name || 'Unnamed candidate'}</span>
            <span className="mt-0.5 block truncate text-sm text-slate-500">{application.title}</span>
          </span>
          {application.priority ? <span aria-label="Priority application" title="Priority" className="text-amber-600">★</span> : null}
        </span>
        <span className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={application.status} />
          <span className="text-xs text-slate-500">{formatDate(application.createdAt, timeZone)}</span>
        </span>
      </button>
    </div>
  </article>
  )
}

export const LoadingState = ({ label = 'Loading applications…' }: { label?: string }) => (
  <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">{label}</div>
)

export const ErrorState = ({ retry }: { retry?: () => void }) => (
  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
    <p className="font-semibold">Applications could not be loaded.</p>
    <p className="mt-1 text-sm">Try again. If this continues, check the API health and request logs.</p>
    {retry ? <button type="button" onClick={retry} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">Try again</button> : null}
  </div>
)

export const EmptyState = ({ filtered = false }: { filtered?: boolean }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <p className="font-semibold text-slate-950">{filtered ? 'No applications match these filters' : 'No applications yet'}</p>
    <p className="mt-1 text-sm text-slate-500">{filtered ? 'Clear or adjust the filters to widen the queue.' : 'New submissions will appear here.'}</p>
  </div>
)
