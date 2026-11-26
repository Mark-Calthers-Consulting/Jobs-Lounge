'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dispatchData, dispatchRequest, type ApprovalRequest, type ApprovalReview, type Dispatch, type Paging } from '@/api/emailDispatches'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { formatDateInTimeZone } from '@/utils/dateTime'
import Modal from '@/components/Modal'

const button = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
export function EmailRequestStatus({ requestId, ownerId }: { requestId: string; ownerId?: string }) {
  const query = useQuery({ queryKey: ['email-request-status', 'own', ownerId, requestId], queryFn: () => dispatchData<Dispatch>(`/${requestId}`), refetchInterval: 15000 })
  return <section aria-label="Requested email status" className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
    {query.isPending && <p role="status">Loading request status…</p>}
    {query.isError && <p role="alert">This request could not be loaded. <button className={button} onClick={() => void query.refetch()}>Try again</button></p>}
    {query.data && <><h2 className="font-semibold">Email request: {query.data.state.replaceAll('-', ' ')}</h2><p className="mt-2 text-sm text-slate-600">{query.data.recipientCount} recipients · {query.data.template}</p>{query.data.approval?.rejectionReason && <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">Reason: {query.data.approval.rejectionReason}</p>}</>}
  </section>
}
function ApprovalDetail({ requestId, ownerId, onDecision }: { requestId: string; ownerId?: string; onDecision: () => Promise<unknown> }) {
  const [format, setFormat] = useState<'html' | 'text'>('html')
  const [mobile, setMobile] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null)
  const [busy, setBusy] = useState(false)
  const [requestKey] = useState(() => crypto.randomUUID())
  const status = useQuery({ queryKey: ['email-request-status', 'review', ownerId, requestId], queryFn: () => dispatchData<Dispatch>(`/${requestId}`) })
  const preview = useQuery({ queryKey: ['email-approval-preview', ownerId, requestId, recipientId], queryFn: () => dispatchData<ApprovalReview>(`/${requestId}/approval-preview`, 'POST', recipientId ? { recipientId } : {}), enabled: status.data?.state === 'awaiting-approval', retry: false })
  const data = preview.data
  const decide = async () => {
    setBusy(true); setError('')
    try {
      await dispatchData(`/${requestId}/${confirm}`, 'POST', confirm === 'approve' ? { requestId: requestKey, fingerprint: data?.fingerprint } : { reason: reason.trim() })
      setConfirm(null); await onDecision(); await status.refetch()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to decide this request.'); setConfirm(null); await preview.refetch(); await status.refetch()
    } finally { setBusy(false) }
  }
  return <section aria-labelledby="email-request-review-heading" className="mt-6 min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 id="email-request-review-heading" className="text-xl font-semibold text-slate-950">Review email request</h2>
    {status.isPending && <div role="status" aria-label="Loading request" className="mt-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
    {status.isError && <p role="alert" className="mt-4 text-red-700">Request could not be loaded. <button className={button} onClick={() => void status.refetch()}>Try again</button></p>}
    {status.data && <><p className="mt-2 text-sm text-slate-600">{status.data.ownerName} · {status.data.state.replaceAll('-', ' ')} · {status.data.recipientCount} requested recipients</p>{status.data.approval?.note && <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-sm">Internal note: {status.data.approval.note}</p>}{status.data.approval?.rejectionReason && <p className="mt-3 whitespace-pre-wrap text-sm text-red-700">Reason: {status.data.approval.rejectionReason}</p>}</>}
    {preview.isFetching && status.data?.state === 'awaiting-approval' && <div role="status" aria-label="Checking recipient eligibility" className="mt-4 h-32 animate-pulse rounded-lg bg-slate-100" />}
    {preview.isError && <p role="alert" className="mt-4 text-sm text-red-700">{preview.error.message} <button className={button} onClick={() => { setRecipientId(''); void preview.refetch() }}>Refresh review</button></p>}
    {data && status.data?.state === 'awaiting-approval' && <div className="mt-4 space-y-4">
      <h3 className="font-semibold text-slate-950">{data.subject}</h3>
      <p className="text-sm font-semibold">{data.recipientCount} eligible recipients</p>
      {data.removedCount > 0 && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{data.removedCount} of the original {data.originalCount} recipients are no longer eligible. Only the remaining {data.recipientCount} can be queued. No new recipients have been added.</p>}
      <details className="rounded-lg border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-700">Recipients ({data.recipientCount})</summary><ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">{data.recipients.map((person) => <li key={person.id} className="break-words text-sm">{person.name} · {person.email}</li>)}</ul></details>
      <label className="block text-sm font-semibold">Preview for<select className={`${button} mt-2 w-full`} disabled={!data.recipientCount} value={recipientId || data.recipients[0]?.id || ''} onChange={(event) => setRecipientId(event.target.value)}>{data.recipients.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.email}</option>)}{!data.recipientCount && <option value="">No eligible recipients</option>}</select></label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Approval preview display">
        <button className={button} aria-pressed={format === 'html'} onClick={() => setFormat('html')}>Email preview</button><button className={button} aria-pressed={format === 'text'} onClick={() => setFormat('text')}>Text version</button>
        <button className={button} aria-pressed={!mobile} disabled={format === 'text'} onClick={() => setMobile(false)}>Desktop</button><button className={button} aria-pressed={mobile} disabled={format === 'text'} onClick={() => setMobile(true)}>Mobile</button>
        <button className={button} onClick={() => void preview.refetch()}>Refresh eligibility</button>
      </div>
      {format === 'html' ? <iframe title="Approval email preview" sandbox="" srcDoc={data.html} className={`mx-auto h-[550px] max-w-full rounded-lg border border-slate-200 ${mobile ? 'w-[375px]' : 'w-full'}`} /> : <pre aria-label="Approval plain text preview" className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">{data.text}</pre>}
    </div>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {status.data?.state === 'awaiting-approval' && <div className="mt-6 space-y-4">
      <label className="block text-sm font-semibold">Reason for rejection<textarea aria-label="Reason for rejection" className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm focus-visible:outline-2 focus-visible:outline-blue-700" value={reason} maxLength={500} rows={3} onChange={(event) => setReason(event.target.value)} /><span className="mt-1 block font-normal text-slate-600">Required only when rejecting. Visible to the requester.</span></label>
      <div className="flex flex-wrap gap-3"><button className={button} disabled={busy || !reason.trim()} onClick={() => setConfirm('reject')}>Reject request</button><button className={`${button} !bg-slate-950 !text-white`} disabled={busy || !data?.recipientCount || preview.isFetching || preview.isError} onClick={() => setConfirm('approve')}>Approve and queue</button></div>
    </div>}
    <Modal isOpen={confirm !== null} onClose={() => setConfirm(null)} onSubmit={() => void decide()} disabled={busy} title={confirm === 'approve' ? 'Approve this exact batch?' : 'Reject email request?'} actionLabel={confirm === 'approve' ? 'Confirm approval and queue' : 'Confirm rejection'} body={<div className="space-y-3 text-sm text-slate-200">{confirm === 'approve' ? <><p>{data?.recipientCount} applicants will be queued using the reviewed template. This does not grant ongoing sending permission.</p><p>Delivery follows existing sending limits. Emails already transmitting cannot be recalled.</p></> : <p className="whitespace-pre-wrap">Reason: {reason}</p>}</div>} />
  </section>
}
export default function EmailApprovalQueue({ initialRequestId, ownerId }: { initialRequestId?: string; ownerId?: string }) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('awaiting-approval')
  const [selected, setSelected] = useState(initialRequestId || '')
  const client = useQueryClient()
  const settings = usePlatformSettings()
  const query = useQuery({ queryKey: ['email-approval-requests', ownerId, page, filter], queryFn: () => dispatchRequest<{ data: ApprovalRequest[]; pagination: Paging }>(`/approval-requests?${new URLSearchParams({ page: String(page), status: filter })}`), refetchInterval: 15000 })
  const onDecision = async () => { await client.invalidateQueries({ queryKey: ['email-approval-requests'] }); await client.invalidateQueries({ queryKey: ['broadcast-history'] }); await client.invalidateQueries({ queryKey: ['teamNotifications'] }); await client.invalidateQueries({ queryKey: ['email-analytics'] }) }
  return <div className="min-w-0">
    <section aria-labelledby="email-approval-queue-heading" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 id="email-approval-queue-heading" className="text-xl font-semibold">Candidate email requests</h2>
      <p className="mt-2 text-sm text-slate-600">Review the message and frozen recipients. Approval queues this batch only.</p>
      <label className="mt-4 block text-sm font-semibold">Request status<select className={`${button} ml-3`} value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1) }}><option value="awaiting-approval">Awaiting approval</option><option value="rejected">Rejected</option><option value="expired">Expired</option><option value="queued">Queued</option><option value="all">All requests</option></select></label>
      {query.isPending && <div role="status" aria-label="Loading email requests" className="mt-4 h-48 animate-pulse rounded-lg bg-slate-100" />}
      {query.isError && <p role="alert" className="mt-4 text-red-700">Requests could not be loaded. <button className={button} onClick={() => void query.refetch()}>Try again</button></p>}
      <ul className="mt-4 divide-y divide-slate-200">{query.data?.data.map((item) => <li key={item._id} className="flex flex-wrap items-start justify-between gap-4 py-4"><div><p className="font-semibold">{item.ownerName} · {item.recipientCount} applicants</p><p className="mt-1 text-sm text-slate-600">{item.template} · {item.state.replaceAll('-', ' ')} · {formatDateInTimeZone(item.submittedAt, settings.timeZone, { dateStyle: 'medium', timeStyle: 'short' })}</p></div><button className={button} aria-pressed={selected === item._id} onClick={() => setSelected(item._id)}>Review request</button></li>)}</ul>
      {query.data && !query.data.data.length && <p className="py-6 text-sm text-slate-600">No requests match this status.</p>}
      {query.data && <nav aria-label="Approval request pagination" className="mt-4 flex items-center justify-between gap-4 text-sm"><button className={button} disabled={!query.data.pagination.hasPreviousPage} onClick={() => setPage(page - 1)}>Previous requests</button><span>Page {page} of {query.data.pagination.totalPages}</span><button className={button} disabled={!query.data.pagination.hasNextPage} onClick={() => setPage(page + 1)}>Next requests</button></nav>}
    </section>
    {selected && <ApprovalDetail key={`${ownerId}:${selected}`} ownerId={ownerId} requestId={selected} onDecision={onDecision} />}
  </div>
}
