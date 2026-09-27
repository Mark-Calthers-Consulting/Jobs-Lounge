'use client'

import {
  PiArrowsClockwise,
  PiCheckCircle,
  PiClock,
  PiWarningCircle,
} from 'react-icons/pi'
import { useApplicationAnalyticsSummary } from '@/hooks/useApplicationWorkspace'
import { formatDateInTimeZone } from '@/utils/dateTime'

const number = (value: number) => value.toLocaleString('en-NG')

const LoadingState = () => (
  <div className="space-y-8" role="status" aria-label="Loading application analytics">
    {[4, 4].map((count, section) => (
      <div key={section} className="animate-pulse">
        <div className="h-5 w-52 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-slate-100" />
        <div className="mt-4 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="border-slate-200 p-5 sm:border-r sm:last:border-r-0">
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    ))}
    <span className="sr-only">Loading application analytics…</span>
  </div>
)

const StatGrid = ({
  items,
}: {
  items: Array<{ label: string; value: number; detail: string }>
}) => (
  <dl className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item, index) => (
      <div
        key={item.label}
        className={`p-5 ${index % 2 === 0 ? 'sm:border-r' : ''} ${index < 2 ? 'border-b xl:border-b-0' : ''} xl:border-r xl:last:border-r-0 border-slate-200`}
      >
        <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
        <dd className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{number(item.value)}</dd>
        <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
      </div>
    ))}
  </dl>
)

const emailStates = [
  {
    key: 'queued' as const,
    label: 'Queued',
    detail: 'Waiting or currently processing',
    icon: PiClock,
    tone: 'bg-slate-100 text-slate-700',
  },
  {
    key: 'sent' as const,
    label: 'Sent',
    detail: 'Accepted by the mail service',
    icon: PiCheckCircle,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'retrying' as const,
    label: 'Retrying',
    detail: 'Another delivery attempt is due',
    icon: PiArrowsClockwise,
    tone: 'bg-amber-50 text-amber-800',
  },
  {
    key: 'failed' as const,
    label: 'Failed',
    detail: 'Delivery attempts were exhausted',
    icon: PiWarningCircle,
    tone: 'bg-red-50 text-red-700',
  },
]

export default function ApplicationAnalyticsSummary() {
  const analytics = useApplicationAnalyticsSummary()

  if (analytics.isLoading) return <LoadingState />

  if (analytics.isError || !analytics.data) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-950">
        <p className="font-semibold">Application analytics could not be loaded.</p>
        <p className="mt-1 text-sm text-red-800">Try again. If this continues, check the API and email worker health.</p>
        <button
          type="button"
          onClick={() => void analytics.refetch()}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    )
  }

  const { applications, confirmations, generatedAt, timeZone } = analytics.data
  const updatedAt = formatDateInTimeZone(generatedAt, timeZone, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="space-y-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Updated {updatedAt}</p>
        <button
          type="button"
          onClick={() => void analytics.refetch()}
          disabled={analytics.isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          <PiArrowsClockwise aria-hidden="true" className={analytics.isFetching ? 'animate-spin' : ''} />
          {analytics.isFetching ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <section aria-labelledby="application-volume-heading">
        <h2 id="application-volume-heading" className="text-xl font-semibold text-slate-950">Applications received</h2>
        <p className="mt-1 text-sm text-slate-500">Calendar periods follow the organization time zone: {timeZone}.</p>
        <div className="mt-4">
          <StatGrid items={[
            { label: 'Today', value: applications.today, detail: 'Since local midnight' },
            { label: 'This week', value: applications.week, detail: 'Since Monday' },
            { label: 'This month', value: applications.month, detail: 'Current calendar month' },
            { label: 'All time', value: applications.allTime, detail: 'All application records' },
          ]} />
        </div>
      </section>

      <section aria-labelledby="confirmation-health-heading">
        <h2 id="confirmation-health-heading" className="text-xl font-semibold text-slate-950">Application confirmation emails</h2>
        <p className="mt-1 text-sm text-slate-500">Delivery health for the automatic email candidates receive after applying.</p>
        <dl className="mt-4 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
          {emailStates.map((state, index) => {
            const Icon = state.icon
            return (
              <div
                key={state.key}
                className={`p-5 ${index % 2 === 0 ? 'sm:border-r' : ''} ${index < 2 ? 'border-b xl:border-b-0' : ''} xl:border-r xl:last:border-r-0 border-slate-200`}
              >
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-medium text-slate-700">{state.label}</dt>
                  <span className={`grid size-9 place-items-center rounded-lg ${state.tone}`}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <dd className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{number(confirmations[state.key])}</dd>
                <p className="mt-1 text-xs text-slate-500">{state.detail}</p>
              </div>
            )
          })}
        </dl>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Sent and failed records remain visible for {confirmations.retentionDays} days. Queued and retrying records remain until resolved.
        </p>
      </section>
    </div>
  )
}
