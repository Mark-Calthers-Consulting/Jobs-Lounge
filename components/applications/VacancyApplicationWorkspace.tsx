'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import type { ApplicationStatus } from '@/constants/enums'
import type { AdminApplication } from '@/types/types'
import Modal from '@/components/Modal'
import {
  useApplicationJobSummary,
  useApplicationList,
  useBulkUpdateApplications,
} from '@/hooks/useApplicationWorkspace'
import ApplicationBoard from './ApplicationBoard'
import ApplicationDetailPanel from './ApplicationDetailPanel'
import ApplicationFilters from './ApplicationFilters'
import ExportRecordsDialog from './ExportRecordsDialog'
import ApplicationWorkspaceNav from './ApplicationWorkspaceNav'
import { applicationFiltersFromUrl } from './urlFilters'
import {
  ApplicationCard,
  EmptyState,
  ErrorState,
  LoadingState,
  StageCounts,
  STAGES,
} from './workspaceUi'

export default function VacancyApplicationWorkspace({ jobId }: { jobId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const filters = useMemo(() => applicationFiltersFromUrl(searchParams, jobId), [jobId, searchParams])
  const summaryFilters = {
    applicantId: filters.applicantId,
    priority: filters.priority,
    education: filters.education,
    nyscStatus: filters.nyscStatus,
    experienceMin: filters.experienceMin,
    experienceMax: filters.experienceMax,
    profileCompleted: filters.profileCompleted,
    appliedFrom: filters.appliedFrom,
    appliedTo: filters.appliedTo,
    hasCv: filters.hasCv,
    hasCoverLetter: filters.hasCoverLetter,
  }
  const summary = useApplicationJobSummary(jobId, summaryFilters)
  const view = searchParams.get('view') === 'board' ? 'board' : 'queue'
  const selectedId = searchParams.get('applicationId') || undefined
  const queue = useApplicationList({ ...filters, jobId, limit: 30 })
  const applications = queue.data?.pages.flatMap((page) => page.data) ?? []
  const matchingTotal = filters.status?.length
    ? filters.status.reduce((total, status) => total + (summary.data?.byStatus[status] || 0), 0)
    : summary.data?.total || 0
  const [selected, setSelected] = useState<Map<string, AdminApplication>>(new Map())
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>()
  const bulk = useBulkUpdateApplications()

  const setParam = (name: string, value?: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== 'applicationId') next.delete('cursor')
    router.replace(`${pathname}?${next}`, { scroll: false })
  }

  const runBulk = async () => {
    if (!bulkStatus) return
    try {
      await bulk.mutateAsync({
        applications: [...selected.values()].map((item) => ({
          applicationId: item.applicationId,
          workflowVersion: item.workflowVersion,
        })),
        status: bulkStatus,
      })
      toast.success(`${selected.size} applications updated`)
      setSelected(new Map())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update applications')
    } finally {
      setBulkStatus(undefined)
    }
  }

  const runBulkPriority = async (priority: boolean) => {
    try {
      const result = await bulk.mutateAsync({
        applications: [...selected.values()].map((item) => ({
          applicationId: item.applicationId,
          workflowVersion: item.workflowVersion,
        })),
        priority,
      })
      toast.success(`${result.updated} applications updated`)
      setSelected(new Map())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update applications')
    }
  }

  if (summary.isLoading) return <LoadingState label="Preparing vacancy workspace…" />
  if (summary.isError || !summary.data) return <ErrorState retry={() => void summary.refetch()} />

  return (
    <div className="space-y-5">
      <ApplicationWorkspaceNav />
      <Modal
        isOpen={Boolean(bulkStatus)}
        onClose={() => setBulkStatus(undefined)}
        onSubmit={() => void runBulk()}
        title={`Move ${selected.size} applications?`}
        body={<p>Every bulk stage change requires confirmation. Candidates are not notified.</p>}
        actionLabel={`Confirm move to ${STAGES.find((stage) => stage.value === bulkStatus)?.label || ''}`}
        actionTone={bulkStatus === 'rejected' ? 'danger' : 'default'}
        disabled={bulk.isPending}
        size="compact"
      />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-950">{summary.data.job.title}</h1>
            <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600">{summary.data.job.archivedAt ? 'Archived' : summary.data.job.status}</span>
          </div>
          <p className="mt-1 text-slate-600">{summary.data.job.company || 'Company not specified'} · {summary.data.total} matching applications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportRecordsDialog
            filters={filters}
            selectedIds={[...selected.keys()]}
            matchingTotal={matchingTotal}
          />
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1" aria-label="Workspace view">
            <button type="button" aria-pressed={view === 'queue'} onClick={() => setParam('view', 'queue')} className={`rounded-md px-4 py-2 text-sm font-semibold ${view === 'queue' ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Split queue</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => setParam('view', 'board')} className={`rounded-md px-4 py-2 text-sm font-semibold ${view === 'board' ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Kanban</button>
          </div>
        </div>
      </header>

      <StageCounts totals={summary.data.byStatus} compact />
      <ApplicationFilters />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Hiring stages and recruiter notes are private.</p>
        <label className="text-sm font-medium text-slate-700">Sort
          <select value={filters.sort} onChange={(event) => setParam('sort', event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
            <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name">Candidate name</option><option value="experience-desc">Experience: high to low</option><option value="experience-asc">Experience: low to high</option><option value="priority">Priority first</option><option value="updated">Recently updated</option>
          </select>
        </label>
      </div>

      {view === 'board' ? (
        <>
          <ApplicationBoard jobId={jobId} filters={filters} selectedId={selectedId} onSelect={(id) => setParam('applicationId', id)} />
          {selectedId ? (
            <div className="max-w-4xl">
              <ApplicationDetailPanel applicationId={selectedId} onClose={() => setParam('applicationId')} />
            </div>
          ) : null}
        </>
      ) : queue.isLoading ? <LoadingState /> : queue.isError ? <ErrorState retry={() => void queue.refetch()} /> : applications.length === 0 ? <EmptyState filtered /> : (
        <>
          {selected.size ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <strong className="text-sm text-blue-950">{selected.size} selected</strong>
              <select defaultValue="" aria-label="Bulk stage change" onChange={(event) => setBulkStatus(event.target.value as ApplicationStatus)} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm">
                <option value="" disabled>Move selected…</option>
                {STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
              </select>
              <button type="button" disabled={bulk.isPending} onClick={() => void runBulkPriority(true)} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-950">Mark priority</button>
              <button type="button" disabled={bulk.isPending} onClick={() => void runBulkPriority(false)} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-950">Remove priority</button>
              <button type="button" onClick={() => setSelected(new Map())} className="text-sm font-semibold text-blue-900 hover:underline">Clear selection</button>
              <span className="text-xs text-blue-800">Only explicitly loaded selections; maximum 100.</span>
            </div>
          ) : null}
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
            <div className="space-y-3">
              {applications.map((application) => (
                <ApplicationCard key={application.applicationId} application={application} selected={selectedId === application.applicationId} onSelect={() => setParam('applicationId', application.applicationId)} selectable checked={selected.has(application.applicationId)} onChecked={(checked) => setSelected((current) => {
                  const next = new Map(current)
                  if (checked && next.size < 100) next.set(application.applicationId, application)
                  else if (!checked) next.delete(application.applicationId)
                  return next
                })} />
              ))}
              {queue.hasNextPage ? <button type="button" onClick={() => {
                const cursor = queue.data?.pages.at(-1)?.pageInfo.nextCursor
                if (cursor) setParam('cursor', cursor)
                void queue.fetchNextPage()
              }} disabled={queue.isFetchingNextPage} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{queue.isFetchingNextPage ? 'Loading…' : 'Load more'}</button> : null}
            </div>
            <div className={selectedId ? 'max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:overflow-y-auto max-lg:bg-slate-50 max-lg:p-3' : ''}>
              <ApplicationDetailPanel applicationId={selectedId} onClose={selectedId ? () => setParam('applicationId') : undefined} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
