'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import type { ApplicationStatus } from '@/constants/enums'
import type { AdminApplication } from '@/types/types'
import Modal from '@/components/Modal'
import { useApplicationList, useBulkUpdateApplications } from '@/hooks/useApplicationWorkspace'
import ApplicationDetailPanel from './ApplicationDetailPanel'
import ApplicationFilters from './ApplicationFilters'
import ExportRecordsDialog from './ExportRecordsDialog'
import ApplicationWorkspaceNav from './ApplicationWorkspaceNav'
import { applicationFiltersFromUrl } from './urlFilters'
import { ApplicationCard, EmptyState, ErrorState, LoadingState, STAGES } from './workspaceUi'

export default function ApplicationsInbox() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const filters = useMemo(() => applicationFiltersFromUrl(searchParams), [searchParams])
  const list = useApplicationList({ ...filters, limit: 30 })
  const selectedId = searchParams.get('applicationId') || undefined
  const applications = list.data?.pages.flatMap((page) => page.data) ?? []
  const stageTotals = list.data?.pages[0]?.stageTotals
  const matchingTotal = stageTotals
    ? (filters.status?.length
      ? filters.status.reduce((sum, status) => sum + stageTotals[status], 0)
      : Object.values(stageTotals).reduce((sum, value) => sum + value, 0))
    : 0
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

  const runBulkStatus = async () => {
    if (!bulkStatus) return
    try {
      await bulk.mutateAsync({
        applications: [...selected.values()].map((application) => ({
          applicationId: application.applicationId,
          workflowVersion: application.workflowVersion,
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
        applications: [...selected.values()].map((application) => ({
          applicationId: application.applicationId,
          workflowVersion: application.workflowVersion,
        })),
        priority,
      })
      toast.success(`${result.updated} applications updated`)
      setSelected(new Map())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update applications')
    }
  }

  return (
    <div className="space-y-4">
      <ApplicationWorkspaceNav />
      <Modal
        isOpen={Boolean(bulkStatus)}
        onClose={() => setBulkStatus(undefined)}
        onSubmit={() => void runBulkStatus()}
        title={`Move ${selected.size} applications?`}
        body={<p>This changes the private hiring stage for only the applications explicitly selected on this loaded queue.</p>}
        actionLabel={`Confirm move to ${STAGES.find((stage) => stage.value === bulkStatus)?.label || ''}`}
        actionTone={bulkStatus === 'rejected' ? 'danger' : 'default'}
        disabled={bulk.isPending}
        size="compact"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Application inbox</h1>
          <p className="mt-1 text-slate-600">Triage candidates across every vacancy.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportRecordsDialog
            filters={filters}
            selectedIds={[...selected.keys()]}
            matchingTotal={matchingTotal}
          />
          <label className="text-sm font-medium text-slate-700">
            Sort
            <select value={filters.sort} onChange={(event) => setParam('sort', event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Candidate name</option>
              <option value="experience-desc">Experience: high to low</option>
              <option value="experience-asc">Experience: low to high</option>
              <option value="priority">Priority first</option>
              <option value="updated">Recently updated</option>
            </select>
          </label>
        </div>
      </div>
      <ApplicationFilters includeVacancy />

      {selected.size ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3" role="region" aria-label="Bulk actions">
          <span className="text-sm font-semibold text-blue-950">{selected.size} selected</span>
          <select aria-label="Bulk stage" defaultValue="" onChange={(event) => setBulkStatus(event.target.value as ApplicationStatus)} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm">
            <option value="" disabled>Move to stage…</option>
            {STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
          </select>
          <button type="button" disabled={bulk.isPending} onClick={() => void runBulkPriority(true)} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-950">Mark priority</button>
          <button type="button" disabled={bulk.isPending} onClick={() => void runBulkPriority(false)} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-950">Remove priority</button>
          <button type="button" onClick={() => setSelected(new Map())} className="text-sm font-semibold text-blue-900 hover:underline">Clear selection</button>
          <span className="text-xs text-blue-800">Up to 100 loaded applications; no hidden “select all”.</span>
        </div>
      ) : null}

      {list.isLoading ? <LoadingState /> : list.isError ? <ErrorState retry={() => void list.refetch()} /> : applications.length === 0 ? <EmptyState filtered={Object.keys(filters).length > 1} /> : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
          <div>
            <p className="mb-3 text-sm text-slate-600" role="status">{applications.length} loaded · {matchingTotal} matching</p>
            <div className="space-y-3">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.applicationId}
                  application={application}
                  selected={selectedId === application.applicationId}
                  onSelect={() => setParam('applicationId', application.applicationId)}
                  selectable
                  checked={selected.has(application.applicationId)}
                  onChecked={(checked) => setSelected((current) => {
                    const next = new Map(current)
                    if (checked && next.size < 100) next.set(application.applicationId, application)
                    else if (!checked) next.delete(application.applicationId)
                    return next
                  })}
                />
              ))}
            </div>
            {list.hasNextPage ? (
              <button type="button" disabled={list.isFetchingNextPage} onClick={() => {
                const cursor = list.data?.pages.at(-1)?.pageInfo.nextCursor
                if (cursor) setParam('cursor', cursor)
                void list.fetchNextPage()
              }} className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
                {list.isFetchingNextPage ? 'Loading…' : 'Load more applications'}
              </button>
            ) : null}
          </div>
          <div className={selectedId ? 'max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:overflow-y-auto max-lg:bg-slate-50 max-lg:p-3' : ''}>
            <ApplicationDetailPanel applicationId={selectedId} onClose={selectedId ? () => setParam('applicationId') : undefined} />
          </div>
        </div>
      )}
    </div>
  )
}
