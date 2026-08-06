'use client'

import Link from 'next/link'
import { LuArrowRight, LuCheck, LuPlus } from 'react-icons/lu'
import AdminAccessNotice from '@/components/AdminAccessNotice'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { useAdminDashboard, useAdminVacancies } from '@/hooks/useAdmin'
import { useApplicationsOverview } from '@/hooks/useApplicationWorkspace'
import { useUser } from '@/hooks/useUsers'
import type { ApplicationStatus, JobStatus } from '@/constants/enums'
import { formatDateInTimeZone } from '@/utils/dateTime'
import { hasStaffPermission } from '@/utils/staffPermissions'

const jobStatusTone: Record<JobStatus, string> = {
  Open: 'bg-emerald-500',
  Draft: 'bg-amber-500',
  Closed: 'bg-slate-400',
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
    <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
    <div className="h-80 animate-pulse rounded-xl bg-slate-100" />
  </div>
)

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
  const today = formatDateInTimeZone(new Date(), timeZone, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const metrics = [
    {
      label: 'Open vacancies',
      value: vacancySummary?.open,
      href: '/admin-center/jobs?view=open',
    },
    {
      label: 'Draft vacancies',
      value: vacancySummary?.draft,
      href: '/admin-center/jobs?view=draft',
    },
    ...(canReviewApplications ? [
      {
        label: 'New applications',
        value: applicationOverview?.totals.pending,
        href: '/admin-center/applications/inbox?status=pending',
      },
      {
        label: 'In review',
        value: applicationOverview?.totals.reviewed,
        href: '/admin-center/applications/inbox?status=reviewed',
      },
      {
        label: 'Candidates',
        value: dashboard.data?.totalCandidates,
        href: '/admin-center/candidates',
      },
    ] : [
      {
        label: 'All vacancies',
        value: vacancySummary?.all,
        href: '/admin-center/jobs',
      },
    ]),
  ]

  const attentionItems = [
    {
      title: 'Draft vacancies',
      description: 'Complete or publish vacancies that are still in draft.',
      count: vacancySummary?.draft || 0,
      href: '/admin-center/jobs?view=draft',
    },
    {
      title: 'Passed deadlines',
      description: 'Review open vacancies whose application deadline has passed.',
      count: vacancySummary?.deadlinePassed || 0,
      href: '/admin-center/jobs?view=deadline-passed',
    },
    ...(canReviewApplications ? [{
      title: 'New applications',
      description: 'Applications waiting for their first review.',
      count: applicationOverview?.totals.pending || 0,
      href: '/admin-center/applications/inbox?status=pending',
    }] : []),
  ].filter((item) => item.count > 0)

  return (
    <div className="space-y-8">
      <AdminAccessNotice />

      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-7">
        <div>
          <p className="text-sm font-medium text-slate-500">{today}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            {canReviewApplications
              ? 'Keep vacancy activity and candidate review moving from one place.'
              : 'Keep vacancy publishing moving and your listings up to date.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canReviewApplications ? (
            <Link href="/admin-center/applications/inbox" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
              Review applications
            </Link>
          ) : (
            <Link href="/admin-center/jobs" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
              Manage vacancies
            </Link>
          )}
          <Link href="/admin-center/jobs/create" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
            <LuPlus aria-hidden="true" />
            Create vacancy
          </Link>
        </div>
      </header>

      {(dashboard.isError || vacancies.isError) ? (
        <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
          Some dashboard information could not be loaded. Refresh to try again.
        </p>
      ) : null}

      <section aria-labelledby="snapshot-heading">
        <h2 id="snapshot-heading" className="sr-only">Workspace snapshot</h2>
        <div className={`grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 ${metrics.length >= 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-3'}`}>
          {metrics.map((metric) => (
            <Link key={metric.label} href={metric.href} className="group border-b border-r border-slate-200 p-5 last:border-r-0 hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 sm:min-h-28">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {metric.value === undefined ? '—' : metric.value.toLocaleString()}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-800 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                View <LuArrowRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.8fr)]">
        <section aria-labelledby="recent-vacancies-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 id="recent-vacancies-heading" className="text-lg font-semibold text-slate-950">Recent vacancies</h2>
              <p className="mt-0.5 text-sm text-slate-500">Your latest vacancy activity.</p>
            </div>
            <Link href="/admin-center/jobs" className="text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">View all</Link>
          </div>
          {vacancies.data?.data.length ? (
            <ul className="divide-y divide-slate-100">
              {vacancies.data.data.map((job) => (
                <li key={job._id}>
                  <Link href={`/admin-center/jobs/${job._id}`} className="grid gap-3 px-5 py-4 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-950">{job.title}</span>
                      <span className="mt-1 block truncate text-sm text-slate-500">
                        {job.company?.name || 'Company not specified'} · {job.location}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span aria-hidden="true" className={`size-2 rounded-full ${jobStatusTone[job.status]}`} />
                      {job.status}
                    </span>
                    <span className="text-sm text-slate-500 sm:text-right">
                      <span className="block font-medium text-slate-800">{(job.totalApplicants || 0).toLocaleString()} applicants</span>
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
            <h2 id="attention-heading" className="text-lg font-semibold text-slate-950">Needs attention</h2>
            <p className="mt-0.5 text-sm text-slate-500">Work that may need a next step.</p>
          </div>
          {attentionItems.length ? (
            <ul className="divide-y divide-slate-100">
              {attentionItems.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="group flex items-start justify-between gap-4 px-5 py-4 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">{item.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-slate-500">{item.description}</span>
                    </span>
                    <span className="min-w-8 text-right text-xl font-semibold text-slate-950">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex gap-3 px-5 py-8">
              <LuCheck aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Nothing urgent</p>
                <p className="mt-1 text-sm text-slate-500">Drafts, deadlines and new applications are clear.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {canReviewApplications ? (
        <section aria-labelledby="recruitment-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="recruitment-heading" className="text-xl font-semibold text-slate-950">Recruitment activity</h2>
              <p className="mt-1 text-sm text-slate-500">Recent submissions and vacancy workloads.</p>
            </div>
            <Link href="/admin-center/applications" className="text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">Open workspace</Link>
          </div>

          {applications.isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" role="status" aria-label="Loading recruitment activity" />
          ) : applications.isError || !applicationOverview ? (
            <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">Recruitment activity could not be loaded.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <h3 className="border-b border-slate-200 px-5 py-4 font-semibold text-slate-950">Latest applications</h3>
                {applicationOverview.recentApplications.length ? (
                  <ul className="divide-y divide-slate-100">
                    {applicationOverview.recentApplications.slice(0, 5).map((application) => {
                      const stage = applicationStage[application.status]
                      return (
                        <li key={application.applicationId}>
                          <Link href={`/admin-center/applications/jobs/${application.jobId}?applicationId=${application.applicationId}`} className="grid gap-2 px-5 py-3.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
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
                <h3 className="border-b border-slate-200 px-5 py-4 font-semibold text-slate-950">Active vacancy workloads</h3>
                {applicationOverview.vacancyWorkloads.length ? (
                  <ul className="divide-y divide-slate-100">
                    {applicationOverview.vacancyWorkloads.slice(0, 5).map((workload) => (
                      <li key={workload.jobId}>
                        <Link href={`/admin-center/applications/jobs/${workload.jobId}`} className="flex items-center justify-between gap-5 px-5 py-3.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">
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
