'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { LuMail, LuRefreshCw, LuSend } from 'react-icons/lu'
import { toast } from 'sonner'

import Modal from '@/components/Modal'
import PaginationControls from '@/components/PaginationControls'
import {
  useCandidateEmailHistory,
  useCandidateEmailRecipients,
  useQueueCandidateEmail,
} from '@/hooks/useAdmin'
import type { CandidateEmailHistoryItem, CandidateEmailRecipient } from '@/types/types'
import { formatDateInTimeZone } from '@/utils/dateTime'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'

const deliveryStatus = (dispatch: CandidateEmailHistoryItem) => {
  if (dispatch.statusCounts.dead === dispatch.recipientCount) return { label: 'Failed', tone: 'bg-red-50 text-red-700' }
  if (dispatch.statusCounts.dead > 0) return { label: 'Partially sent', tone: 'bg-amber-50 text-amber-800' }
  if (dispatch.statusCounts.pending > 0 || dispatch.statusCounts.retry > 0) return { label: 'Delivering', tone: 'bg-blue-50 text-blue-700' }
  return { label: 'Sent', tone: 'bg-emerald-50 text-emerald-700' }
}

export default function RecruiterCandidateEmailCenter() {
  const { timeZone } = usePlatformSettings()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [vacancyId, setVacancyId] = useState('')
  const [page, setPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [selected, setSelected] = useState<Map<string, CandidateEmailRecipient>>(new Map())
  const [previewId, setPreviewId] = useState<string>()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(false)
  const requestIdRef = useRef<string | null>(null)
  const recipientsQuery = useCandidateEmailRecipients({
    search: deferredSearch || undefined,
    vacancyId: vacancyId || undefined,
    page,
    limit: 20,
  })
  const historyQuery = useCandidateEmailHistory(historyPage)
  const queueMutation = useQueueCandidateEmail()
  const recipients = recipientsQuery.data?.data || []
  const selectedRecipients = useMemo(() => [...selected.values()], [selected])
  const preview = selectedRecipients.find((recipient) => recipient.applicationId === previewId)
    || selectedRecipients[0]
  const canReview = selected.size > 0
    && selected.size <= 50
    && subject.trim().length >= 3
    && subject.trim().length <= 150
    && message.trim().length > 0
    && message.trim().length <= 4000

  useEffect(() => {
    requestIdRef.current = null
  }, [message, selected, subject])

  const toggleRecipient = (recipient: CandidateEmailRecipient) => {
    setSelected((current) => {
      const next = new Map(current)
      if (next.has(recipient.applicationId)) next.delete(recipient.applicationId)
      else if (next.size < 50) next.set(recipient.applicationId, recipient)
      else toast.error('You can select up to 50 recipients.')
      return next
    })
  }

  const allPageSelected = recipients.length > 0
    && recipients.every((recipient) => selected.has(recipient.applicationId))
  const toggleCurrentPage = () => {
    setSelected((current) => {
      const next = new Map(current)
      if (allPageSelected) recipients.forEach((recipient) => next.delete(recipient.applicationId))
      else {
        for (const recipient of recipients) {
          if (next.size >= 50) break
          next.set(recipient.applicationId, recipient)
        }
      }
      return next
    })
  }

  const send = async () => {
    requestIdRef.current ||= crypto.randomUUID()
    try {
      const result = await queueMutation.mutateAsync({
        requestId: requestIdRef.current,
        applicationIds: selectedRecipients.map((recipient) => recipient.applicationId),
        subject: subject.trim(),
        message: message.trim(),
      })
      toast.success(`${result.recipientCount} candidate email${result.recipientCount === 1 ? '' : 's'} queued.`)
      setConfirming(false)
      setSelected(new Map())
      setPreviewId(undefined)
      setSubject('')
      setMessage('')
      requestIdRef.current = null
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to queue candidate emails')
      if (error instanceof Error && error.message.toLowerCase().includes('access changed')) {
        setSelected(new Map())
        requestIdRef.current = null
        void recipientsQuery.refetch()
      }
    }
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="candidate-recipient-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#101A35] text-xs font-bold text-white">1</span>
            <div>
              <h2 id="candidate-recipient-heading" className="text-lg font-semibold text-slate-950">Select candidates</h2>
              <p className="text-sm text-slate-600">Only applicants to vacancies you uploaded are available here.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Vacancy
              <select value={vacancyId} onChange={(event) => { setVacancyId(event.target.value); setPage(1) }} className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal sm:w-64">
                <option value="">All my vacancies</option>
                {recipientsQuery.data?.vacancies.map((vacancy) => <option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Search candidates
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Name or email" className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-normal sm:w-64" />
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm">
          <button type="button" onClick={toggleCurrentPage} disabled={!recipients.length} className="font-semibold text-blue-700 disabled:text-slate-400">{allPageSelected ? 'Clear this page' : 'Select this page'}</button>
          <span aria-live="polite" className="text-slate-600">{selected.size} of 50 selected</span>
        </div>
        {recipientsQuery.isLoading ? (
          <div className="space-y-3 p-5" role="status" aria-label="Loading candidate recipients">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-md bg-slate-100" />)}</div>
        ) : recipientsQuery.isError ? (
          <div className="p-8 text-center"><p className="text-sm text-red-700">Unable to load candidate recipients.</p><button type="button" onClick={() => void recipientsQuery.refetch()} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><LuRefreshCw /> Try again</button></div>
        ) : recipients.length === 0 ? (
          <div className="p-10 text-center"><p className="font-medium text-slate-900">No matching applicants</p><p className="mt-1 text-sm text-slate-600">Try another vacancy or clear the search.</p></div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {recipients.map((recipient) => (
              <li key={recipient.applicationId}>
                <label className="grid cursor-pointer gap-3 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[auto_1fr_1fr_0.55fr] sm:items-center">
                  <input type="checkbox" aria-label={`Select ${recipient.name} for ${recipient.vacancy.title}`} checked={selected.has(recipient.applicationId)} onChange={() => toggleRecipient(recipient)} className="size-4 accent-blue-700" />
                  <span><span className="block text-sm font-semibold text-slate-950">{recipient.name}</span><span className="block text-xs text-slate-500">{recipient.email}</span></span>
                  <span><span className="block text-sm text-slate-800">{recipient.vacancy.title}</span><span className="block text-xs text-slate-500">{recipient.vacancy.status}</span></span>
                  <span className="text-sm capitalize text-slate-600">{recipient.status}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <PaginationControls pagination={recipientsQuery.data?.pagination} onPageChange={setPage} />
      </section>

      <section aria-labelledby="candidate-compose-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#101A35] text-xs font-bold text-white">2</span><div><h2 id="candidate-compose-heading" className="text-lg font-semibold text-slate-950">Write and review</h2><p className="text-sm text-slate-600">Send a plain-text operational message about the selected applications.</p></div></div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-5">
            <div><label htmlFor="candidate-email-subject" className="block text-sm font-semibold text-slate-800">Subject</label><input id="candidate-email-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={150} className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950" /></div>
            <div><label htmlFor="candidate-email-message" className="block text-sm font-semibold text-slate-800">Message</label><textarea id="candidate-email-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={8} placeholder="Write the message candidates should receive." className="mt-2 w-full rounded-md border border-slate-300 p-3 leading-6 text-slate-950" /><span className="mt-1 block text-right text-xs text-slate-500">{message.length}/4000</span></div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-semibold text-slate-950">Recipient preview</h3>{selectedRecipients.length > 1 ? <select value={preview?.applicationId || ''} onChange={(event) => setPreviewId(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">{selectedRecipients.map((recipient) => <option key={recipient.applicationId} value={recipient.applicationId}>{recipient.name} · {recipient.vacancy.title}</option>)}</select> : null}</div>
            {preview ? <div className="pt-5 text-sm leading-6 text-slate-700"><p className="font-semibold text-slate-950">{subject || 'Your subject'}</p><p className="mt-5">Hello {preview.name},</p><p className="mt-3 whitespace-pre-line">{message || 'Your message will appear here.'}</p><div className="mt-4 rounded-md border border-slate-200 bg-white p-3"><p className="text-xs font-semibold text-slate-500">Added automatically</p><p className="mt-2">Regarding your application for {preview.vacancy.title}</p></div><p className="mt-5 text-xs text-slate-500">The final email includes a secure link to the candidate&apos;s Applications page.</p></div> : <div className="flex min-h-56 items-center justify-center text-center text-sm text-slate-500">Select at least one candidate to preview the email.</div>}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-600">Messages are queued and delivered by the email worker.</p><button type="button" disabled={!canReview || queueMutation.isPending} onClick={() => setConfirming(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#101A35] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><LuSend aria-hidden="true" />{selected.size ? `Review ${selected.size} email${selected.size === 1 ? '' : 's'}` : 'Review email'}</button></div>
      </section>

      <section aria-labelledby="candidate-email-history-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5"><div className="flex items-center gap-2"><LuMail className="text-blue-700" /><h2 id="candidate-email-history-heading" className="text-lg font-semibold text-slate-950">Recent candidate emails</h2></div><p className="mt-1 text-sm text-slate-600">Your delivery activity from the last 30 days.</p></div>
        {historyQuery.isLoading ? <div className="h-32 animate-pulse bg-slate-50" role="status" aria-label="Loading candidate email history" /> : historyQuery.isError ? <div className="p-8 text-center"><p className="text-sm text-red-700">Unable to load recent email activity.</p><button type="button" onClick={() => void historyQuery.refetch()} className="mt-3 font-semibold text-blue-700">Try again</button></div> : !historyQuery.data?.data.length ? <div className="p-10 text-center text-sm text-slate-600">You have not queued any candidate emails yet.</div> : <ul className="divide-y divide-slate-200">{historyQuery.data.data.map((dispatch) => { const status = deliveryStatus(dispatch); return <li key={dispatch.dispatchId} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><p className="text-sm font-semibold text-slate-950">Candidate email</p><p className="text-xs text-slate-500">Queued {formatDateInTimeZone(dispatch.queuedAt, timeZone, { dateStyle: 'medium', timeStyle: 'short' })}</p></div><div><p className="text-sm text-slate-700">{dispatch.recipientPreview.join(', ')}{dispatch.recipientCount > dispatch.recipientPreview.length ? ` +${dispatch.recipientCount - dispatch.recipientPreview.length}` : ''}</p><p className="text-xs text-slate-500">{dispatch.statusCounts.sent} sent · {dispatch.statusCounts.pending} queued · {dispatch.statusCounts.retry} retrying · {dispatch.statusCounts.dead} failed</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span></li> })}</ul>}
        <PaginationControls pagination={historyQuery.data?.pagination} onPageChange={setHistoryPage} />
      </section>

      <Modal isOpen={confirming} onClose={() => setConfirming(false)} onSubmit={() => void send()} title="Queue candidate emails?" actionLabel={queueMutation.isPending ? 'Queueing…' : `Queue ${selected.size} email${selected.size === 1 ? '' : 's'}`} disabled={queueMutation.isPending} actionDisabled={!canReview} size="compact" body={<div className="space-y-3 text-sm leading-6 text-slate-200"><p>Your message will be queued for {selected.size} candidate{selected.size === 1 ? '' : 's'}.</p><p>Every selected application will be checked again to confirm it belongs to one of your uploaded vacancies.</p></div>} />
    </div>
  )
}
