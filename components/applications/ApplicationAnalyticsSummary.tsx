'use client'

import Link from 'next/link'
import {
  PiArrowsClockwise,
  PiCheckCircle,
  PiClock,
  PiWarningCircle,
} from 'react-icons/pi'
import { useApplicationAnalyticsSummary } from '@/hooks/useApplicationWorkspace'
import { formatDateInTimeZone } from '@/utils/dateTime'
import { STAGES } from './workspaceUi'
import type { ApplicationAnalyticsSummary as AnalyticsSummary } from '@/types/types'

const number = (value: number) => value.toLocaleString('en-NG')
const calendarDate = (value: string) => new Intl.DateTimeFormat('en-NG', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${value}T12:00:00.000Z`))

const comparison = (current: number, previous: number) => {
  if (previous === 0) return current === 0
    ? 'No applications in either period'
    : 'No applications in the previous period'
  const difference = current - previous
  if (difference === 0) return 'The same as the previous period'
  return `${number(Math.abs(difference))} ${difference > 0 ? 'more' : 'fewer'} than the previous period`
}

const DailyTrend = ({ recruitment }: { recruitment: AnalyticsSummary['recruitment'] }) => {
  const { daily, current, previous, distinctApplicants } = recruitment.applications
  const highest = Math.max(1, ...daily.map((day) => day.count))
  const { fromDate, throughDate, previousFromDate, previousThroughDate } = recruitment.period

  return (
    <section aria-labelledby="application-trend-heading" className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 id="application-trend-heading" className="text-xl font-semibold text-slate-950 text-balance">Application trend</h2>
          <p className="mt-1 text-sm text-slate-600 text-pretty">
            {calendarDate(fromDate)} to {calendarDate(throughDate)} · 30 completed calendar days
          </p>
        </div>
        <Link href="/admin-center/applications/inbox" className="text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
          Open application inbox
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div><p className="text-sm text-slate-600">Applications</p><p className="mt-1 text-3xl font-semibold tabular-nums text-slate-950">{number(current)}</p></div>
        <div><p className="text-sm text-slate-600">Previous 30 days</p><p className="mt-1 text-3xl font-semibold tabular-nums text-slate-950">{number(previous)}</p></div>
        <div><p className="text-sm text-slate-600">Distinct applicants</p><p className="mt-1 text-3xl font-semibold tabular-nums text-slate-950">{number(distinctApplicants)}</p></div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700">{comparison(current, previous)}.</p>
      <p className="mt-1 text-xs text-slate-500">Previous period: {calendarDate(previousFromDate)} to {calendarDate(previousThroughDate)}.</p>
      <p className="mt-1 text-xs text-slate-500">Distinct applicants counts each candidate once, even if they applied to multiple vacancies.</p>
      {current === 0 ? (
        <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No applications were received during these 30 completed days.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg bg-slate-50 p-4" aria-hidden="true">
          <ol className="flex h-40 min-w-max items-end gap-2">
            {daily.map((day) => (
              <li key={day.date} className="flex h-full w-3 shrink-0 items-end" title={`${calendarDate(day.date)}: ${number(day.count)} applications`}>
                <span className="block w-full rounded-t bg-blue-700" style={{ height: day.count ? `${Math.max(4, day.count / highest * 100)}%` : '0%' }} />
              </li>
            ))}
          </ol>
          <div className="mt-2 flex justify-between gap-4 text-xs text-slate-600"><span>{calendarDate(fromDate)}</span><span>{calendarDate(throughDate)}</span></div>
        </div>
      )}
      <details className="mt-4 rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">View daily application counts</summary>
        <div className="max-h-72 overflow-auto border-t border-slate-200">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Applications received on each completed calendar day</caption>
            <thead className="bg-slate-50"><tr><th scope="col" className="px-4 py-2">Date</th><th scope="col" className="px-4 py-2 text-right">Applications</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{daily.map((day) => (
              <tr key={day.date}><th scope="row" className="px-4 py-2 font-normal"><time dateTime={day.date}>{calendarDate(day.date)}</time></th><td className="px-4 py-2 text-right tabular-nums">{number(day.count)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

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

  const { applications, recruitment, confirmations, generatedAt, timeZone } = analytics.data
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

      <DailyTrend recruitment={recruitment} />

      <section aria-labelledby="review-workload-heading">
        <h2 id="review-workload-heading" className="text-xl font-semibold text-slate-950 text-balance">Review workload</h2>
        <p className="mt-1 text-sm text-slate-600 text-pretty">
          Current stages of applications received in the 30-day period. These are not historical stage transitions.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((stage) => (
            <div key={stage.value} className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="text-sm font-medium text-slate-600">{stage.label}</dt>
              <dd className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{number(recruitment.applications.currentStages[stage.value])}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm font-medium text-slate-600">Pending for more than seven days</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{number(recruitment.workload.pendingOlderThanSevenDays)}</p>
            <p className="mt-1 text-xs text-slate-500">Current backlog across all applications, not limited to the trend period.</p>
          </div>
          <Link href="/admin-center/applications/inbox?status=pending" className="mt-4 inline-block text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:mt-0">
            Review pending applications
          </Link>
        </div>
      </section>

      <section aria-labelledby="vacancy-demand-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="vacancy-demand-heading" className="text-xl font-semibold text-slate-950 text-balance">Vacancy demand</h2>
            <p className="mt-1 text-sm text-slate-600 text-pretty">Most applications received during the 30 completed days.</p>
          </div>
          <Link href="/admin-center/applications/by-vacancy" className="text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
            View vacancy inbox
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {recruitment.topVacancies.length ? (
              <ol className="divide-y divide-slate-100">
                {recruitment.topVacancies.map((vacancy, index) => (
                  <li key={vacancy.jobId} className="flex items-center gap-4 p-4">
                    <span aria-hidden="true" className="w-6 shrink-0 text-sm font-semibold tabular-nums text-slate-500">{index + 1}.</span>
                    <div className="min-w-0 flex-1">
                      {vacancy.available ? (
                        <Link href={`/admin-center/applications/jobs/${vacancy.jobId}`} className="block truncate font-semibold text-slate-950 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
                          {vacancy.title}
                        </Link>
                      ) : <p className="font-semibold text-slate-700">{vacancy.title}</p>}
                      <p className="mt-1 truncate text-xs text-slate-500">{vacancy.company || 'Company unavailable'}{vacancy.archived ? ' · Archived' : ''}</p>
                    </div>
                    <span className="shrink-0 text-right"><strong className="block text-xl tabular-nums text-slate-950">{number(vacancy.applications)}</strong><span className="text-xs text-slate-500">applications</span></span>
                  </li>
                ))}
              </ol>
            ) : <p className="p-6 text-sm text-slate-600">No vacancies received applications in this period.</p>}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-600">Open vacancies with no applications</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-950">{number(recruitment.workload.openVacanciesWithoutApplications)}</p>
            <p className="mt-2 text-xs text-slate-500 text-pretty">Current open vacancies with zero applications over their lifetime.</p>
            <Link href="/admin-center/applications/by-vacancy?view=open" className="mt-5 inline-block text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
              Review open vacancies
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="candidate-snapshot-heading">
        <h2 id="candidate-snapshot-heading" className="text-xl font-semibold text-slate-950 text-balance">Candidate snapshot</h2>
        <p className="mt-1 text-sm text-slate-600 text-pretty">Current registered accounts and profile state, plus candidates who have ever applied.</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Registered candidates', value: recruitment.candidates.registered },
            { label: 'Profiles complete now', value: recruitment.candidates.profilesComplete },
            { label: 'Have applied at least once', value: recruitment.candidates.everApplied },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
              <dd className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{number(item.value)}</dd>
            </div>
          ))}
        </dl>
        <Link href="/admin-center/candidates" className="mt-4 inline-block text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
          Open candidates
        </Link>
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
