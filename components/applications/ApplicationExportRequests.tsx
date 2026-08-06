'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Modal from '@/components/Modal'
import PaginationControls from '@/components/PaginationControls'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import {
  downloadComprehensiveExport,
  saveDownloadedFile,
} from '@/api/applicationWorkspace'
import {
  useApplicationExportRequests,
  useApproveApplicationExport,
  useCancelApplicationExport,
  useRejectApplicationExport,
} from '@/hooks/useApplicationWorkspace'
import { useUser } from '@/hooks/useUsers'
import type { ApplicationExportRequest, ApplicationExportStatus } from '@/types/types'
import { ErrorState, LoadingState } from './workspaceUi'

const STATUS_LABELS: Record<ApplicationExportStatus, string> = {
  pending: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

const statusClass = (status: ApplicationExportStatus) => ({
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-600',
  expired: 'border-slate-200 bg-slate-50 text-slate-600',
})[status]

const filterSummary = (request: ApplicationExportRequest) => {
  if (request.scope === 'selected') return 'Explicitly selected applications'
  const parts = []
  if (request.filters.jobId) parts.push('one vacancy')
  if (request.filters.applicantId) parts.push('one candidate')
  if (request.filters.status?.length) parts.push(`${request.filters.status.length} stage filter${request.filters.status.length === 1 ? '' : 's'}`)
  if (request.filters.priority !== undefined) parts.push(request.filters.priority ? 'priority only' : 'non-priority only')
  if (request.filters.appliedFrom || request.filters.appliedTo) parts.push('date range')
  return parts.length ? `Filtered by ${parts.join(', ')}` : 'All matching applications'
}

export default function ApplicationExportRequests() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { timeZone } = usePlatformSettings()
  const user = useUser()
  const isSuperAdmin = user.data?.role === 'super-admin'
  const page = Number(searchParams.get('page') || 1)
  const status = (searchParams.get('status') || undefined) as ApplicationExportStatus | undefined
  const requests = useApplicationExportRequests({ page, limit: 20, status })
  const approve = useApproveApplicationExport()
  const reject = useRejectApplicationExport()
  const cancel = useCancelApplicationExport()
  const [review, setReview] = useState<{ action: 'approve' | 'reject' | 'cancel'; request: ApplicationExportRequest }>()
  const [reason, setReason] = useState('')
  const [downloadingId, setDownloadingId] = useState<string>()
  const formatter = useMemo(() => new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }), [timeZone])

  const update = (name: string, value?: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== 'page') next.delete('page')
    router.replace(`${pathname}?${next}`, { scroll: false })
  }

  const format = (value?: string) => value ? formatter.format(new Date(value)) : 'Not available'

  const completeReview = async () => {
    if (!review) return
    try {
      if (review.action === 'approve') {
        await approve.mutateAsync({
          exportId: review.request.exportId,
          expectedRevision: review.request.revision,
        })
        toast.success('Export request approved')
      } else if (review.action === 'reject') {
        await reject.mutateAsync({
          exportId: review.request.exportId,
          expectedRevision: review.request.revision,
          reason,
        })
        toast.success('Export request rejected')
      } else {
        await cancel.mutateAsync({
          exportId: review.request.exportId,
          expectedRevision: review.request.revision,
        })
        toast.success('Export request cancelled')
      }
      setReview(undefined)
      setReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update this export request')
    }
  }

  const download = async (request: ApplicationExportRequest) => {
    setDownloadingId(request.exportId)
    try {
      const file = await downloadComprehensiveExport(request.exportId)
      saveDownloadedFile(file)
      toast.success('Application records downloaded')
      await requests.refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download this export')
    } finally {
      setDownloadingId(undefined)
    }
  }

  const reviewPending = approve.isPending || reject.isPending || cancel.isPending

  return (
    <div className="space-y-6">
      <Modal
        isOpen={Boolean(review)}
        onClose={() => {
          setReview(undefined)
          setReason('')
        }}
        onSubmit={() => void completeReview()}
        title={review?.action === 'approve'
          ? 'Approve comprehensive export?'
          : review?.action === 'reject'
            ? 'Reject comprehensive export?'
            : 'Cancel export request?'}
        actionLabel={reviewPending ? 'Saving…' : review?.action === 'approve' ? 'Approve export' : review?.action === 'reject' ? 'Reject export' : 'Cancel request'}
        actionTone={review?.action === 'approve' ? 'default' : 'danger'}
        disabled={reviewPending}
        actionDisabled={review?.action === 'reject' && reason.trim().length < 5}
        size="compact"
        body={review ? (
          <div className="space-y-4 text-sm text-slate-200">
            <p>
              This request contains {review.request.recordCount.toLocaleString()} candidate-identifiable application records.
            </p>
            {review.action === 'approve' ? (
              <p>The requester will have 24 hours and up to three download attempts.</p>
            ) : null}
            {review.action === 'reject' ? (
              <label className="block">
                <span className="mb-1.5 block font-semibold text-white">Reason for rejection</span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-md border border-slate-500 bg-white p-3 text-slate-950"
                  placeholder="Explain why this export cannot be approved"
                />
                <span className="mt-1 block text-xs">{reason.trim().length}/500 characters · minimum 5</span>
              </label>
            ) : null}
          </div>
        ) : <span />}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Application export requests</h1>
          <p className="mt-1 text-slate-600">
            {isSuperAdmin
              ? 'Review governed downloads of candidate-identifiable application records.'
              : 'Track your comprehensive export requests and approved downloads.'}
          </p>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            value={status || ''}
            onChange={(event) => update('status', event.target.value || undefined)}
            className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">All requests</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {requests.isLoading ? <LoadingState label="Loading export requests…" /> : requests.isError || !requests.data ? <ErrorState retry={() => void requests.refetch()} /> : requests.data.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="font-semibold text-slate-950">No export requests</h2>
          <p className="mt-1 text-sm text-slate-500">Comprehensive export requests will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {requests.data.data.map((request) => (
              <li key={request.exportId} className="p-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-slate-950">{request.recordCount.toLocaleString()} records</strong>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(request.status)}`}>
                        {STATUS_LABELS[request.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{filterSummary(request)}</p>
                    {isSuperAdmin && request.requester ? (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        Requested by {request.requester.name || request.requester.email}
                      </p>
                    ) : null}
                    {request.rejectionReason ? (
                      <p className="mt-2 text-sm text-red-700"><strong>Reason:</strong> {request.rejectionReason}</p>
                    ) : null}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div><dt className="text-slate-500">Requested</dt><dd className="font-medium text-slate-800">{format(request.requestedAt)}</dd></div>
                    <div><dt className="text-slate-500">Downloads</dt><dd className="font-medium text-slate-800">{request.downloadCount}/3</dd></div>
                    <div className="col-span-2"><dt className="text-slate-500">{request.status === 'approved' ? 'Download expires' : 'Request expires'}</dt><dd className="font-medium text-slate-800">{format(request.status === 'approved' ? request.downloadExpiresAt : request.pendingExpiresAt)}</dd></div>
                  </dl>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    {request.status === 'approved'
                      && request.downloadsRemaining > 0
                      && request.requester?._id === user.data?._id ? (
                      <button type="button" onClick={() => void download(request)} disabled={downloadingId === request.exportId} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
                        {downloadingId === request.exportId ? 'Downloading…' : 'Download CSV'}
                      </button>
                    ) : null}
                    {isSuperAdmin && request.status === 'pending' ? (
                      <>
                        <button type="button" onClick={() => setReview({ action: 'approve', request })} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Approve</button>
                        <button type="button" onClick={() => setReview({ action: 'reject', request })} className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Reject</button>
                      </>
                    ) : null}
                    {!isSuperAdmin && request.status === 'pending' ? (
                      <button type="button" onClick={() => setReview({ action: 'cancel', request })} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel request</button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <PaginationControls pagination={requests.data.pagination} onPageChange={(nextPage) => update('page', String(nextPage))} />
        </div>
      )}
    </div>
  )
}
