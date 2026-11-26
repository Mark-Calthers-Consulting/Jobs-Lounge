'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PiArrowsClockwise, PiDownloadSimple, PiFilePdf } from 'react-icons/pi'
import {
  useApplicationAnalyticsSummary,
  useVacancyAnalytics,
} from '@/hooks/useApplicationWorkspace'
import { downloadRecruitmentAnalytics, saveDownloadedFile } from '@/api/applicationWorkspace'
import type {
  AnalyticsComparison,
  AnalyticsPeriodSelection,
  ApplicationAnalyticsSummary as Summary,
} from '@/types/types'
import { STAGES } from './workspaceUi'
import ActivityTrend from './analytics/ActivityTrend'
import { calendarDate, changeLabel, count } from './analytics/reporting'
import { formatDateInTimeZone } from '@/utils/dateTime'

const control =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
const action = `${control} font-semibold hover:bg-slate-50 active:translate-y-px`
const link =
  'text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-blue-700'
const presets = [
  ['last7', 'Last 7 days'],
  ['last30', 'Last 30 days'],
  ['last90', 'Last 90 days'],
  ['this-reporting-week', 'This reporting week'],
  ['last-reporting-week', 'Last reporting week'],
  ['custom', 'Custom dates'],
] as const

function Metric({ label, comparison }: { label: string; comparison: AnalyticsComparison }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">
        {count(comparison.current)}
      </dd>
      <p className="mt-3 text-sm font-semibold text-blue-900">{changeLabel(comparison)}</p>
      <p className="mt-1 text-xs text-slate-500">
        {count(comparison.previous)} in the previous period
        {comparison.previous === 0
          ? ` · change ${comparison.change >= 0 ? '+' : ''}${count(comparison.change)}`
          : ''}
      </p>
    </div>
  )
}

function Snapshot({ items }: { items: Array<[string, number]> }) {
  return (
    <dl
      className={`mt-4 grid gap-4 ${items.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2 xl:grid-cols-4'}`}
    >
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
          <dt className="text-sm text-slate-600">{label}</dt>
          <dd className="mt-2 text-2xl font-semibold tabular-nums">{count(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

function VacancyBreakdown({
  selection,
  report,
}: {
  selection: AnalyticsPeriodSelection
  report: Summary
}) {
  const [page, setPage] = useState(1)
  const query = useVacancyAnalytics(selection, page)
  return (
    <section
      aria-labelledby="vacancy-demand-heading"
      aria-busy={query.isFetching}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="vacancy-demand-heading" className="text-xl font-semibold text-slate-950">
            Vacancy demand
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Applications in either comparison period, ranked by selected period volume.
          </p>
        </div>
        <Link className={link} href="/admin-center/applications/by-vacancy">
          View vacancy inbox
        </Link>
      </div>
      {query.isPending ? (
        <div
          role="status"
          aria-label="Loading vacancy analytics"
          className="h-48 animate-pulse rounded-xl bg-slate-200"
        />
      ) : query.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p>Vacancy analytics could not be loaded.</p>
          <button className={`${action} mt-3`} onClick={() => void query.refetch()}>
            Retry vacancy analytics
          </button>
        </div>
      ) : (
        query.data && (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Vacancy application comparison and current review stages
                </caption>
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {[
                      'Vacancy',
                      'Applications',
                      'Previous',
                      'Change',
                      ...STAGES.map((stage) => stage.label),
                    ].map((title) => (
                      <th
                        className="whitespace-nowrap px-4 py-3 font-medium"
                        scope="col"
                        key={title}
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {query.data.data.map((vacancy) => (
                    <tr key={vacancy.jobId}>
                      <th scope="row" className="min-w-48 px-4 py-4 font-normal">
                        {vacancy.available ? (
                          <Link
                            className={`${link} text-slate-950`}
                            href={`/admin-center/applications/jobs/${vacancy.jobId}`}
                          >
                            {vacancy.title}
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-600">{vacancy.title}</span>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          {vacancy.company || 'Company unavailable'}
                          {vacancy.archived ? ' · Archived' : ''}
                        </p>
                      </th>
                      <td className="px-4 py-4 font-semibold tabular-nums">
                        {count(vacancy.applications)}
                      </td>
                      <td className="px-4 py-4 tabular-nums">{count(vacancy.previous)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs">
                        {changeLabel(vacancy.comparison)}
                      </td>
                      {STAGES.map((stage) => (
                        <td className="px-4 py-4 tabular-nums" key={stage.value}>
                          {count(vacancy.currentStages[stage.value])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!query.data.data.length && (
                    <tr>
                      <td colSpan={8} className="p-6 text-slate-600">
                        No vacancies received applications in either period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
              <p>
                {count(query.data.pagination.total)} vacancies
                {query.data.pagination.totalPages
                  ? ` · Page ${page} of ${query.data.pagination.totalPages}`
                  : ''}
              </p>
              <div className="flex gap-2">
                <button
                  className={action}
                  disabled={!query.data.pagination.hasPreviousPage || query.isFetching}
                  onClick={() => setPage(page - 1)}
                >
                  Previous vacancies
                </button>
                <button
                  className={action}
                  disabled={!query.data.pagination.hasNextPage || query.isFetching}
                  onClick={() => setPage(page + 1)}
                >
                  Next vacancies
                </button>
              </div>
            </div>
          </>
        )
      )}
      <p className="text-xs text-slate-500">
        Stage counts describe the current stage of applications received from{' '}
        {calendarDate(report.recruitment.period.fromDate)} to{' '}
        {calendarDate(report.recruitment.period.throughDate)}.
      </p>
      {query.isFetching && !query.isPending && (
        <p role="status" className="sr-only">
          Updating vacancy analytics…
        </p>
      )}
    </section>
  )
}

export default function ApplicationAnalyticsSummary() {
  const [draft, setDraft] = useState<AnalyticsPeriodSelection>({ preset: 'last30' })
  const [applied, setApplied] = useState<AnalyticsPeriodSelection>({ preset: 'last30' })
  const [validation, setValidation] = useState('')
  const [exportError, setExportError] = useState('')
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null)
  const analytics = useApplicationAnalyticsSummary(applied)
  const report = analytics.data
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied)
  const unavailable =
    dirty ||
    analytics.isFetching ||
    analytics.isLoading ||
    analytics.isError ||
    !report ||
    Boolean(exporting)
  const fixedSelection: AnalyticsPeriodSelection | undefined = report
    ? {
        preset: 'custom',
        from: report.recruitment.period.fromDate,
        to: report.recruitment.period.throughDate,
      }
    : undefined
  const apply = (event: React.FormEvent) => {
    event.preventDefault()
    if (draft.preset === 'custom') {
      const days = (Date.parse(draft.to || '') - Date.parse(draft.from || '')) / 86400000 + 1
      const today = report
        ? new Intl.DateTimeFormat('en-CA', { timeZone: report.timeZone }).format(new Date())
        : ''
      if (
        !draft.from ||
        !draft.to ||
        !Number.isFinite(days) ||
        days < 1 ||
        days > 366 ||
        (today && draft.to > today)
      ) {
        setValidation('Choose a valid date range of up to 366 days, ending no later than today.')
        return
      }
    }
    setValidation('')
    setExportError('')
    setApplied({ ...draft })
  }
  const exportReport = async (format: 'pdf' | 'csv') => {
    if (unavailable || !report || !fixedSelection) return
    setExporting(format)
    setExportError('')
    try {
      if (format === 'pdf') {
        const { downloadRecruitmentPdf } = await import('./analytics/RecruitmentPdf')
        await downloadRecruitmentPdf(report)
      } else saveDownloadedFile(await downloadRecruitmentAnalytics(fixedSelection))
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : 'The report could not be downloaded. Please try again.',
      )
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-8 font-sans">
      <section
        aria-label="Reporting controls"
        className="rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <form onSubmit={apply} className="flex flex-wrap items-end gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Reporting period
              <select
                className={control}
                value={draft.preset}
                onChange={(event) => {
                  setDraft({ preset: event.target.value as AnalyticsPeriodSelection['preset'] })
                  setValidation('')
                }}
              >
                {presets.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {draft.preset === 'custom' && (
              <>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  From
                  <input
                    className={control}
                    type="date"
                    required
                    value={draft.from || ''}
                    onChange={(event) => setDraft({ ...draft, from: event.target.value })}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Through
                  <input
                    className={control}
                    type="date"
                    required
                    value={draft.to || ''}
                    onChange={(event) => setDraft({ ...draft, to: event.target.value })}
                  />
                </label>
              </>
            )}
            <button
              className={action}
              type="submit"
              disabled={analytics.isFetching || Boolean(exporting)}
            >
              Apply period
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-900 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={unavailable}
              onClick={() => void exportReport('pdf')}
            >
              <PiFilePdf aria-hidden="true" />
              {exporting === 'pdf' ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            <button
              className={`inline-flex items-center gap-2 ${action}`}
              disabled={unavailable}
              onClick={() => void exportReport('csv')}
            >
              <PiDownloadSimple aria-hidden="true" />
              {exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Reporting weeks run Friday to Thursday. Last 7, 30 and 90 days exclude today. Dates follow{' '}
          {report?.timeZone || 'the organization time zone'}.
        </p>
        {dirty && (
          <p role="status" className="mt-2 text-sm text-amber-800">
            Apply your chosen period to update the report and enable exports.
          </p>
        )}
        {validation && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {validation}
          </p>
        )}
        {exportError && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {exportError}
          </p>
        )}
        {exporting && (
          <p role="status" className="sr-only">
            Preparing your {exporting.toUpperCase()} report.
          </p>
        )}
      </section>

      {analytics.isLoading ? (
        <div role="status" aria-label="Loading application analytics" className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          <span className="sr-only">Loading application analytics…</span>
        </div>
      ) : analytics.isError || !report ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold">Application analytics could not be loaded.</p>
          <p className="mt-2 text-sm">
            {analytics.error?.message || 'Try again to load this reporting period.'}
          </p>
          <button className={`${action} mt-4`} onClick={() => void analytics.refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {calendarDate(report.recruitment.period.fromDate)} to{' '}
                {calendarDate(report.recruitment.period.throughDate)}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Compared with {calendarDate(report.recruitment.period.previousFromDate)} to{' '}
                {calendarDate(report.recruitment.period.previousThroughDate)} ·{' '}
                {report.recruitment.period.dayCount} days
              </p>
              {report.recruitment.period.incomplete && (
                <p className="mt-2 text-sm font-medium text-amber-800">
                  Includes today and is incomplete. The previous period contains complete days.
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Updated{' '}
                {formatDateInTimeZone(report.generatedAt, report.timeZone, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <button
              className={`inline-flex items-center gap-2 ${action}`}
              disabled={analytics.isFetching || Boolean(exporting)}
              onClick={() => void analytics.refetch()}
            >
              <PiArrowsClockwise aria-hidden="true" />
              {analytics.isFetching ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <dl className="grid gap-4 md:grid-cols-3">
            <Metric
              label="Applications received"
              comparison={report.recruitment.applications.comparison}
            />
            <Metric
              label="Distinct applicants"
              comparison={report.recruitment.applications.applicantComparison}
            />
            <Metric label="New registrations" comparison={report.recruitment.registrations} />
          </dl>
          <p className="text-xs text-slate-500">
            Distinct applicants counts each candidate once per period. Registration figures count
            accounts created in each period that still exist; deleted accounts cannot be
            reconstructed.
          </p>
          <ActivityTrend
            title="Application trend"
            id="applications"
            daily={report.recruitment.applications.daily}
            previousDaily={report.recruitment.applications.previousDaily}
            current={report.recruitment.applications.current}
            previous={report.recruitment.applications.previous}
          />
          <ActivityTrend
            title="Registration trend"
            id="registrations"
            daily={report.recruitment.registrations.daily}
            previousDaily={report.recruitment.registrations.previousDaily}
            current={report.recruitment.registrations.current}
            previous={report.recruitment.registrations.previous}
            colour="#bd2435"
          />
          <section aria-labelledby="review-workload-heading">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 id="review-workload-heading" className="text-xl font-semibold text-slate-950">
                Current review stages
              </h2>
              <Link className={link} href="/admin-center/applications/inbox">
                Open application inbox
              </Link>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Current stages of applications received in the selected period, not historical stage
              transitions or hiring outcomes.
            </p>
            <Snapshot
              items={STAGES.map((stage) => [
                stage.label,
                report.recruitment.applications.currentStages[stage.value],
              ])}
            />
          </section>
          <VacancyBreakdown
            key={`${report.recruitment.period.fromDate}:${report.recruitment.period.throughDate}`}
            selection={fixedSelection!}
            report={report}
          />
          <section aria-labelledby="candidate-snapshot-heading">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 id="candidate-snapshot-heading" className="text-xl font-semibold text-slate-950">
                Candidate snapshot
              </h2>
              <Link className={link} href="/admin-center/candidates">
                Open candidates
              </Link>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Current accounts and profile state, independent of the selected period.
            </p>
            <Snapshot
              items={[
                ['Registered candidates', report.recruitment.candidates.registered],
                ['Profiles complete now', report.recruitment.candidates.profilesComplete],
                ['Have applied at least once', report.recruitment.candidates.everApplied],
              ]}
            />
          </section>
          <section aria-labelledby="current-workload-heading">
            <h2 id="current-workload-heading" className="text-xl font-semibold text-slate-950">
              Current workload
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Across all records, not limited to the selected period.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600">
                  Applications awaiting first review over seven days
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {count(report.recruitment.workload.pendingOlderThanSevenDays)}
                </p>
                <Link
                  href="/admin-center/applications/inbox?status=pending"
                  className={`mt-4 inline-block ${link}`}
                >
                  Review pending applications
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600">Open vacancies with no applications</p>
                <p className="mt-2 text-2xl font-semibold">
                  {count(report.recruitment.workload.openVacanciesWithoutApplications)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  No applications over the vacancy’s lifetime.
                </p>
                <Link
                  href="/admin-center/applications/by-vacancy?view=open"
                  className={`mt-4 inline-block ${link}`}
                >
                  Review open vacancies
                </Link>
              </div>
            </div>
          </section>
          <section aria-labelledby="application-volume-heading">
            <h2 id="application-volume-heading" className="text-xl font-semibold text-slate-950">
              Calendar application totals
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Independent of the selected period. This week starts Monday.
            </p>
            <Snapshot
              items={[
                ['Today', report.applications.today],
                ['This week', report.applications.week],
                ['This month', report.applications.month],
                ['All time', report.applications.allTime],
              ]}
            />
          </section>
          <details className="rounded-xl border border-slate-200 bg-white p-6">
            <summary className="cursor-pointer text-lg font-semibold focus-visible:outline-2 focus-visible:outline-blue-700">
              Application confirmation emails
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Current retained email records, not filtered by the reporting period. Sent means
              accepted by SMTP, not confirmed inbox delivery.
            </p>
            <Snapshot
              items={(['queued', 'sent', 'retrying', 'failed'] as const).map((state) => [
                state,
                report.confirmations[state],
              ])}
            />
            <p className="mt-4 text-xs text-slate-500">
              Terminal records are retained for {report.confirmations.retentionDays} days. Queued
              and retrying records remain until resolved.
            </p>
          </details>
        </>
      )}
    </div>
  )
}
