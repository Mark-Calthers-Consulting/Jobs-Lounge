'use client'

import Link from 'next/link'
import { useApplicationsOverview } from '@/hooks/useApplicationWorkspace'
import {
  EmptyState,
  ErrorState,
  formatDate,
  LoadingState,
  StageCounts,
  StatusBadge,
} from './workspaceUi'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import ApplicationExportsMenu from './ApplicationExportsMenu'

export default function ApplicationsOverview() {
  const { timeZone } = usePlatformSettings()
  const overview = useApplicationsOverview()

  if (overview.isLoading) return <LoadingState label="Preparing the recruitment workspace…" />
  if (overview.isError || !overview.data) return <ErrorState retry={() => void overview.refetch()} />

  const { totals, vacancyWorkloads, recentApplications } = overview.data
  const total = Object.values(totals).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{total.toLocaleString()} applications across all vacancies</p>
        <div>
          <ApplicationExportsMenu total={total} />
        </div>
      </div>

      <StageCounts totals={totals} />

      <section aria-labelledby="workloads-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="workloads-heading" className="text-xl font-semibold text-slate-950">Vacancy workloads</h2>
            <p className="mt-1 text-sm text-slate-500">The six vacancies with the most recent activity.</p>
          </div>
          <Link href="/admin-center/applications/by-vacancy" className="text-sm font-semibold text-blue-800 hover:underline">View all</Link>
        </div>
        {vacancyWorkloads.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {vacancyWorkloads.map((job) => (
              <Link key={job.jobId} href={`/admin-center/applications/jobs/${job.jobId}`} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
                <p className="truncate font-semibold text-slate-950">{job.title}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{job.company || 'Company not specified'}</p>
                <div className="mt-5 flex items-end justify-between">
                  <span>
                    <span className="block text-2xl font-semibold">{job.total}</span>
                    <span className="text-xs text-slate-500">applications</span>
                  </span>
                  <span className="text-right text-sm">
                    <span className="block font-medium text-blue-800">{job.byStatus.pending} new</span>
                    <span className="text-xs text-slate-500">Latest {formatDate(job.latestApplicationAt, timeZone)}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : <EmptyState />}
      </section>

      <section aria-labelledby="newest-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="newest-heading" className="text-xl font-semibold text-slate-950">Newest applications</h2>
            <p className="mt-1 text-sm text-slate-500">The ten most recent submissions.</p>
          </div>
          <Link href="/admin-center/applications/inbox" className="text-sm font-semibold text-blue-800 hover:underline">Open full inbox</Link>
        </div>
        {recentApplications.length ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {recentApplications.map((application) => (
                <li key={application.applicationId}>
                  <Link href={`/admin-center/applications/jobs/${application.jobId}?applicationId=${application.applicationId}`} className="grid gap-2 px-4 py-4 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-950">{application.name}</span>
                      <span className="block truncate text-sm text-slate-500">{application.email}</span>
                    </span>
                    <span className="truncate text-sm text-slate-700">{application.title}</span>
                    <StatusBadge status={application.status} />
                    <span className="text-sm text-slate-500">{formatDate(application.createdAt, timeZone)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : <EmptyState />}
      </section>
    </div>
  )
}
