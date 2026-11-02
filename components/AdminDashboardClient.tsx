'use client'

import Link from 'next/link'
import type { IconType } from 'react-icons'
import {
  PiArrowRight, PiBriefcase, PiCheckCircle, PiClock, PiFileText,
  PiPlus, PiUserCircle, PiUsersThree, PiWarningCircle,
} from 'react-icons/pi'
import AdminAccessNotice from '@/components/AdminAccessNotice'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { useAdminDashboard, useAdminVacancies } from '@/hooks/useAdmin'
import { useApplicationsOverview } from '@/hooks/useApplicationWorkspace'
import { useUser } from '@/hooks/useUsers'
import type { ApplicationStatus, JobStatus } from '@/constants/enums'
import { formatDateInTimeZone } from '@/utils/dateTime'
import { hasStaffPermission } from '@/utils/staffPermissions'

const jobStatusTone: Record<JobStatus, string> = {
  Open: 'bg-emerald-50 text-emerald-800',
  Draft: 'bg-amber-50 text-amber-900',
  Closed: 'bg-slate-100 text-slate-700',
}

const applicationStage: Record<ApplicationStatus, { label: string; tone: string }> = {
  pending: { label: 'New', tone: 'bg-blue-600' },
  reviewed: { label: 'In review', tone: 'bg-amber-500' },
  shortlisted: { label: 'Shortlisted', tone: 'bg-emerald-600' },
  rejected: { label: 'Rejected', tone: 'bg-red-500' },
}

const DashboardSkeleton = () => (
  <div className="space-y-6" role="status" aria-label="Loading dashboard">
    <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />)}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.8fr)]"><div className="h-80 animate-pulse rounded-xl bg-slate-100" /><div className="h-80 animate-pulse rounded-xl bg-slate-100" /></div>
  </div>
)

type DailyCount = { date: string; count: number }
type ActivityTrend = { current: number; previous: number; daily: DailyCount[]; label: string }
const calendarDate = (value: string) => new Intl.DateTimeFormat('en-NG', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${value}T12:00:00.000Z`))
type DashboardMetric = {
  label: string
  value?: number
  href: string
  detail?: string
  icon: IconType
  tone: string
  trend?: ActivityTrend
}

const trendDescription = ({ current, previous, label }: ActivityTrend) => {
  const isRegistrationTrend = label === 'new registrations'
  if (previous === 0) return isRegistrationTrend
    ? `New registrations: ${current.toLocaleString()} vs 0`
    : current === 0 ? 'No change vs prior period' : `${current.toLocaleString()} vs 0 prior`
  const change = Math.round((current - previous) / previous * 100)
  const signedChange = `${change > 0 ? '+' : change < 0 ? '−' : ''}${Math.abs(change)}%`
  return isRegistrationTrend ? `New registrations: ${signedChange}` : `${signedChange} vs prior 30 days`
}

const Sparkline = ({ daily }: { daily: DailyCount[] }) => {
  const highest = Math.max(...daily.map(({ count }) => count), 1)
  const points = daily.map(({ count }, index) => `${index * 120 / Math.max(daily.length - 1, 1)},${31 - count * 26 / highest}`).join(' ')
  return <svg aria-hidden="true" viewBox="0 0 120 34" preserveAspectRatio="none" className="h-7 w-16 shrink-0 text-blue-700"><polyline fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points={points} /></svg>
}

const MetricCard = ({ metric }: { metric: DashboardMetric }) => {
  const Icon = metric.icon
  return (
    <Link href={metric.href} className="group flex min-h-36 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-slate-300 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
      <div className="flex items-center gap-2">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${metric.tone}`}><Icon aria-hidden="true" className="size-5" /></span>
        <span className="min-w-0 text-sm font-medium text-slate-600 text-balance">{metric.label}</span>
      </div>
      <strong className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-950">{metric.value === undefined ? '—' : metric.value.toLocaleString()}</strong>
      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
        <span className="min-w-0 text-xs leading-4 text-slate-500 text-pretty">
          {metric.detail ? <span className="block">{metric.detail}</span> : null}
          {metric.trend ? <span className="block font-medium text-blue-800">{trendDescription(metric.trend)}</span> : null}
        </span>
        {metric.trend ? <Sparkline daily={metric.trend.daily} /> : <PiArrowRight aria-hidden="true" className="size-4 shrink-0 text-slate-400 group-hover:text-blue-700" />}
      </div>
    </Link>
  )
}

export default function AdminDashboardClient() {
  const user = useUser()
  const dashboard = useAdminDashboard()
  const vacancies = useAdminVacancies({ page: 1, limit: 6, sort: 'newest' })
  const { timeZone } = usePlatformSettings()
  const canReviewApplications = hasStaffPermission(user.data?.role, 'applications:review')
  const applications = useApplicationsOverview(canReviewApplications)

  if (user.isLoading || dashboard.isLoading || vacancies.isLoading) return <DashboardSkeleton />

  const firstName = user.data?.firstName || user.data?.name?.trim().split(/\s+/)[0]
  const vacancySummary = vacancies.data?.summary
  const applicationOverview = applications.data
  const insights = dashboard.data?.insights
  const today = formatDateInTimeZone(new Date(), timeZone, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const metrics: DashboardMetric[] = [
    {
      label: 'Open vacancies',
      value: vacancySummary?.open,
      href: '/admin-center/jobs?view=open',
      icon: PiBriefcase,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    ...(canReviewApplications ? [
      {
        label: 'Applications awaiting first review',
        value: insights?.pendingOverSevenDays,
        href: '/admin-center/applications/inbox?status=pending&sort=oldest',
        detail: 'More than seven days old',
        icon: PiClock,
        tone: 'bg-amber-50 text-amber-800',
      },
      {
        label: 'Applications received (last 30 days)',
        value: insights?.applications.current,
        href: '/admin-center/applications/inbox',
        detail: 'All review stages',
        icon: PiFileText,
        tone: 'bg-blue-50 text-blue-700',
        trend: insights ? { ...insights.applications, label: 'applications' } : undefined,
      },
      {
        label: 'In review',
        value: applicationOverview?.totals.reviewed,
        href: '/admin-center/applications/inbox?status=reviewed',
        icon: PiUsersThree,
        tone: 'bg-violet-50 text-violet-700',
      },
      {
        label: 'Registered candidates',
        value: insights?.registeredCandidates,
        href: '/admin-center/candidates?view=registered',
        detail: 'Current total',
        icon: PiUserCircle,
        tone: 'bg-sky-50 text-sky-700',
        trend: insights ? { ...insights.registrations, label: 'new registrations' } : undefined,
      },
    ] : [
      {
        label: 'All vacancies',
        value: vacancySummary?.all,
        href: '/admin-center/jobs',
        icon: PiFileText,
        tone: 'bg-blue-50 text-blue-700',
      },
      {
        label: 'Passed deadlines',
        value: vacancySummary?.deadlinePassed,
        href: '/admin-center/jobs?view=deadline-passed',
        icon: PiClock,
        tone: 'bg-amber-50 text-amber-800',
      },
    ]),
  ]

  const attentionItems = [
    ...(canReviewApplications ? [{
      title: 'Unreviewed over seven days',
      description: 'Applications awaiting their first review. Opens oldest first.',
      count: insights?.pendingOverSevenDays || 0,
      href: '/admin-center/applications/inbox?status=pending&sort=oldest',
    }] : []),
    ...(canReviewApplications ? [{
      title: 'All unreviewed applications',
      description: 'Applications waiting for their first review, regardless of age.',
      count: applicationOverview?.totals.pending || 0,
      href: '/admin-center/applications/inbox?status=pending',
    }] : []),
    {
      title: 'Passed deadlines',
      description: 'Open vacancies whose application deadline has passed.',
      count: vacancySummary?.deadlinePassed || 0,
      href: '/admin-center/jobs?view=deadline-passed',
    },
    {
      title: 'Draft vacancies',
      description: 'Complete or publish vacancies that are still in draft.',
      count: vacancySummary?.draft || 0,
      href: '/admin-center/jobs?view=draft',
    },
  ].filter((item) => item.count > 0)
  const attentionUnavailable = vacancies.isError || (canReviewApplications && (dashboard.isError || applications.isError || !insights))

  return (
    <div className="space-y-8 font-sans">
      <AdminAccessNotice />

      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">{today}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 text-balance">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 text-pretty">
            {canReviewApplications
              ? 'Keep vacancy activity and candidate review moving from one place.'
              : 'Keep vacancy publishing moving and your listings up to date.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canReviewApplications ? (
            <Link href="/admin-center/applications/inbox" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
              Review applications
            </Link>
          ) : (
            <Link href="/admin-center/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
              Manage vacancies
            </Link>
          )}
          <Link href="/admin-center/jobs/create" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
            <PiPlus aria-hidden="true" />
            Create vacancy
          </Link>
        </div>
      </header>

      {(dashboard.isError || vacancies.isError || (canReviewApplications && !dashboard.isLoading && !insights)) ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Some dashboard information is unavailable right now. Refresh to try again.
        </p>
      ) : null}

      <section aria-labelledby="snapshot-heading">
        <h2 id="snapshot-heading" className="sr-only">Workspace snapshot</h2>
        <div className={`grid gap-3 sm:grid-cols-2 ${metrics.length >= 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-3'}`}>
          {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </div>
        {canReviewApplications && insights ? <p className="mt-3 text-xs text-slate-500 text-pretty">Applications and new registrations cover {calendarDate(insights.period.fromDate)} to {calendarDate(insights.period.throughDate)}, compared with the previous 30 full days in {insights.timeZone}. Other cards show current totals.</p> : null}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.8fr)]">
        <section aria-labelledby="recent-vacancies-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-800"><PiBriefcase aria-hidden="true" className="size-5" /></span>
              <div>
                <h2 id="recent-vacancies-heading" className="text-lg font-semibold text-slate-950">Recent vacancies</h2>
                <p className="mt-0.5 text-sm text-slate-500">{canReviewApplications ? 'Latest listings and their application counts.' : 'Latest listings and their status.'}</p>
              </div>
            </div>
            <Link href="/admin-center/jobs" className="shrink-0 text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">View all vacancies</Link>
          </div>
          {vacancies.isError ? (
            <p role="alert" className="p-6 text-sm text-red-800">Recent vacancies could not be loaded.</p>
          ) : vacancies.data?.data.length ? (
            <ul className="divide-y divide-slate-100">
              {vacancies.data.data.map((job) => (
                <li key={job._id}>
                  <Link href={`/admin-center/jobs/${job._id}`} className="grid gap-3 px-5 py-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-950">{job.title}</span>
                      <span className="mt-1 block truncate text-sm text-slate-500">
                        {job.company?.name || 'Company not specified'} · {job.location}
                      </span>
                    </span>
                    <span className={`w-fit rounded-lg px-3 py-1 text-xs font-semibold ${jobStatusTone[job.status]}`}>
                      {job.status}
                    </span>
                      <span className="text-sm text-slate-500 sm:text-right">
                        {canReviewApplications ? <span className="block font-medium text-slate-800">{(job.totalApplicants || 0).toLocaleString()} applicants</span> : null}
                        <span className="text-xs">Updated {formatDateInTimeZone(job.updatedAt, timeZone)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-slate-900">No vacancies yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first vacancy to begin.</p>
            </div>
          )}
        </section>

        <section aria-labelledby="attention-heading" className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-800"><PiWarningCircle aria-hidden="true" className="size-5" /></span>
              <div>
                <h2 id="attention-heading" className="text-lg font-semibold text-slate-950">Needs attention</h2>
                <p className="mt-0.5 text-sm text-slate-500">Work that may need a next step.</p>
              </div>
            </div>
          </div>
          {attentionItems.length ? (
            <ul className="divide-y divide-slate-100">
              {attentionItems.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="group flex items-start justify-between gap-4 px-5 py-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">{item.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-slate-500">{item.description}</span>
                    </span>
                    <span className="min-w-8 text-right text-xl font-semibold text-slate-950">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : attentionUnavailable ? (
            <p role="alert" className="px-5 py-8 text-sm text-red-800">Attention items could not be confirmed. Refresh to try again.</p>
          ) : (
            <div className="flex gap-3 px-5 py-8">
              <PiCheckCircle aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Nothing urgent</p>
                <p className="mt-1 text-sm text-slate-500">No pending work needs attention right now.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {canReviewApplications ? (
        <section aria-labelledby="recruitment-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><PiUsersThree aria-hidden="true" className="size-5" /></span>
              <div>
                <h2 id="recruitment-heading" className="text-xl font-semibold text-slate-950">Recruitment activity</h2>
                <p className="mt-1 text-sm text-slate-500">Recent submissions and vacancy workloads.</p>
              </div>
            </div>
            <Link href="/admin-center/applications" className="text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">Open application workspace</Link>
          </div>

          {applications.isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" role="status" aria-label="Loading recruitment activity" />
          ) : applications.isError || !applicationOverview ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Recruitment activity could not be loaded.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><h3 className="font-semibold text-slate-950">Latest applications</h3><Link href="/admin-center/applications/inbox" className="text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">View all</Link></div>
                {applicationOverview.recentApplications.length ? (
                  <ul className="divide-y divide-slate-100">
                    {applicationOverview.recentApplications.slice(0, 5).map((application) => {
                      const stage = applicationStage[application.status]
                      return (
                        <li key={application.applicationId}>
                          <Link href={`/admin-center/applications/jobs/${application.jobId}?applicationId=${application.applicationId}`} className="grid gap-2 px-5 py-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-slate-950">{application.name || 'Unnamed candidate'}</span>
                              <span className="mt-0.5 block truncate text-sm text-slate-500">{application.title}</span>
                            </span>
                            <span className="text-sm text-slate-500 sm:text-right">
                              <span className="flex items-center gap-2 sm:justify-end">
                                <span aria-hidden="true" className={`size-2 rounded-full ${stage.tone}`} />
                                {stage.label}
                              </span>
                              <span className="mt-0.5 block text-xs">{formatDateInTimeZone(application.createdAt, timeZone)}</span>
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                ) : <p className="px-5 py-10 text-center text-sm text-slate-500">No applications yet.</p>}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><h3 className="font-semibold text-slate-950">Vacancy workloads</h3><Link href="/admin-center/applications/by-vacancy" className="text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">View all</Link></div>
                {applicationOverview.vacancyWorkloads.length ? (
                  <ul className="divide-y divide-slate-100">
                    {applicationOverview.vacancyWorkloads.slice(0, 5).map((workload) => (
                      <li key={workload.jobId}>
                        <Link href={`/admin-center/applications/jobs/${workload.jobId}`} className="flex items-center justify-between gap-5 px-5 py-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-950">{workload.title}</span>
                            <span className="mt-0.5 block truncate text-sm text-slate-500">{workload.company || 'Company not specified'}</span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-lg font-semibold text-slate-950">{workload.total.toLocaleString()}</span>
                            <span className="block text-xs font-medium text-blue-800">{workload.byStatus.pending.toLocaleString()} new</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : <p className="px-5 py-10 text-center text-sm text-slate-500">No vacancy workloads yet.</p>}
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
