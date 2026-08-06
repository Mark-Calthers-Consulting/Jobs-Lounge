'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useApplicationJobs } from '@/hooks/useApplicationWorkspace'
import PaginationControls from '@/components/PaginationControls'
import { EmptyState, ErrorState, formatDate, LoadingState, STAGES } from './workspaceUi'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import VacancySummaryButton from './VacancySummaryButton'
import ApplicationWorkspaceNav from './ApplicationWorkspaceNav'

export default function ApplicationJobDirectory() {
  const { timeZone } = usePlatformSettings()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const search = searchParams.get('search') || ''
  const searchTimer = useRef<number | undefined>(undefined)
  const page = Number(searchParams.get('page') || 1)
  const view = (searchParams.get('view') || 'all') as 'all' | 'open' | 'draft' | 'closed' | 'archived'
  const sort = (searchParams.get('sort') || 'newest-application') as 'newest-application' | 'applications' | 'new' | 'name'
  const jobs = useApplicationJobs({ page, limit: 20, search: searchParams.get('search') || undefined, view, sort })

  const update = (name: string, value?: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== 'page') next.delete('page')
    router.replace(`${pathname}?${next}`, { scroll: false })
  }

  useEffect(() => () => window.clearTimeout(searchTimer.current), [])

  return (
    <div className="space-y-5">
      <ApplicationWorkspaceNav />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Vacancy inbox</h1>
          <p className="mt-1 text-slate-600">Choose a vacancy to open its focused review workspace.</p>
        </div>
        <VacancySummaryButton filters={{ search: search || undefined, view, sort }} />
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_auto_auto]">
        <label className="sr-only" htmlFor="application-job-search">Search vacancies</label>
        <input
          key={search}
          id="application-job-search"
          defaultValue={search}
          onChange={(event) => {
            const value = event.target.value.trim()
            window.clearTimeout(searchTimer.current)
            searchTimer.current = window.setTimeout(() => update('search', value || undefined), 350)
          }}
          placeholder="Search vacancy, company or location…"
          className="rounded-lg border border-slate-300 px-3 py-2.5"
        />
        <select aria-label="Job status" value={view} onChange={(event) => update('view', event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5">
          <option value="all">All active vacancies</option><option value="open">Open</option><option value="draft">Draft</option><option value="closed">Closed</option><option value="archived">Archived</option>
        </select>
        <select aria-label="Sort vacancy workloads" value={sort} onChange={(event) => update('sort', event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5">
          <option value="newest-application">Newest application</option><option value="applications">Most applications</option><option value="new">Most New</option><option value="name">Vacancy name</option>
        </select>
      </div>

      {jobs.isLoading ? <LoadingState label="Loading vacancy workloads…" /> : jobs.isError || !jobs.data ? <ErrorState retry={() => void jobs.refetch()} /> : jobs.data.data.length === 0 ? <EmptyState filtered={Boolean(search || view !== 'all')} /> : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {jobs.data.data.map((job) => (
              <li key={job.jobId}>
                <Link href={`/admin-center/applications/jobs/${job.jobId}`} className="block px-5 py-5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-950">{job.title}</span>
                      <span className="mt-1 block truncate text-sm text-slate-500">{job.company || 'Company not specified'} · {job.jobStatus || 'Archived'}</span>
                    </span>
                    <span className="grid grid-cols-4 gap-3 text-center">
                      {STAGES.map((stage) => <span key={stage.value}><span className="block font-semibold text-slate-900">{job.byStatus[stage.value]}</span><span className="text-xs text-slate-500">{stage.label}</span></span>)}
                    </span>
                    <span className="text-right">
                      <span className="block text-xl font-semibold">{job.total}</span>
                      <span className="text-xs text-slate-500">total · latest {formatDate(job.latestApplicationAt, timeZone)}</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <PaginationControls pagination={jobs.data.pagination} onPageChange={(nextPage) => update('page', String(nextPage))} />
        </div>
      )}
    </div>
  )
}
