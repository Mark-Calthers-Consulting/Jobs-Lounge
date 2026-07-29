'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ApplicationStatus } from '@/constants/enums'
import {
  useAddApplicationNote,
  useApplicationActivity,
  useApplicationDetail,
  useUpdateApplicationWorkflow,
} from '@/hooks/useApplicationWorkspace'
import Modal from '@/components/Modal'
import { ErrorState, formatDate, LoadingState, STAGES, StatusBadge } from './workspaceUi'

const safeDocumentLink = (value?: string) => {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export default function ApplicationDetailPanel({
  applicationId,
  onClose,
}: {
  applicationId?: string
  onClose?: () => void
}) {
  const detail = useApplicationDetail(applicationId)
  const activity = useApplicationActivity(applicationId)
  const update = useUpdateApplicationWorkflow()
  const addNote = useAddApplicationNote()
  const [note, setNote] = useState('')
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus>()

  if (!applicationId) {
    return (
      <div className="flex min-h-[34rem] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Select an application to review the candidate and submitted documents.
      </div>
    )
  }
  if (detail.isLoading) return <LoadingState label="Loading candidate review…" />
  if (detail.isError || !detail.data) return <ErrorState retry={() => void detail.refetch()} />

  const { application, candidate, duplicateSignal } = detail.data
  const cv = safeDocumentLink(application.cvLink)
  const coverLetter = safeDocumentLink(application.coverLetterLink)
  const liveCv = safeDocumentLink(candidate?.cvLink)
  const liveCoverLetter = safeDocumentLink(candidate?.coverLetterLink)

  const changeStatus = async (status: ApplicationStatus, undo = false) => {
    const previous = application.status
    try {
      await update.mutateAsync({
        applicationId,
        expectedVersion: application.workflowVersion,
        status,
        undo,
      })
      toast.success(`Moved to ${STAGES.find((stage) => stage.value === status)?.label}`, {
        duration: undo ? 4000 : 8000,
        action: !undo && status !== previous ? {
          label: 'Undo',
          onClick: () => void changeStatus(previous, true),
        } : undefined,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to change stage')
    } finally {
      setPendingStatus(undefined)
    }
  }

  const togglePriority = async () => {
    try {
      await update.mutateAsync({
        applicationId,
        expectedVersion: application.workflowVersion,
        priority: !application.priority,
      })
      toast.success(application.priority ? 'Removed from priority' : 'Marked as priority')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to change priority')
    }
  }

  const submitNote = async () => {
    const value = note.trim()
    if (!value) return
    try {
      await addNote.mutateAsync({ applicationId, note: value })
      setNote('')
      toast.success('Private note added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add note')
    }
  }

  const activities = activity.data?.pages.flatMap((page) => page.data) ?? []

  return (
    <section aria-label="Application review" className="rounded-xl border border-slate-200 bg-white">
      <Modal
        isOpen={pendingStatus === 'rejected'}
        onClose={() => setPendingStatus(undefined)}
        onSubmit={() => void changeStatus('rejected')}
        title="Reject this application?"
        body={<p>This moves the candidate to the private Rejected stage. Candidates are not notified.</p>}
        actionLabel="Move to Rejected"
        actionTone="danger"
        disabled={update.isPending}
        size="compact"
      />
      <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 rounded-t-xl border-b border-slate-200 bg-white p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold text-slate-950">{candidate?.name || application.candidateSnapshot?.name || 'Unnamed candidate'}</h2>
            <StatusBadge status={application.status} />
            {application.priority ? <span className="text-sm font-medium text-amber-700">★ Priority</span> : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">Applied {formatDate(application.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void togglePriority()} disabled={update.isPending} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
            {application.priority ? 'Remove priority' : 'Mark priority'}
          </button>
          {onClose ? <button type="button" onClick={onClose} aria-label="Close candidate detail" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Close</button> : null}
        </div>
      </div>

      <div className="space-y-7 p-5">
        {duplicateSignal.possibleDuplicate ? (
          <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Possible duplicate candidate account detected using {duplicateSignal.matchFields.join(' and ')}.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</p>
            <a className="mt-2 block break-all text-sm font-medium text-blue-800 hover:underline" href={`mailto:${candidate?.email}`}>{candidate?.email || 'Not provided'}</a>
            <a className="mt-1 block text-sm text-slate-700 hover:underline" href={candidate?.telephone ? `tel:${candidate.telephone}` : undefined}>{candidate?.telephone || 'Not provided'}</a>
            {candidate?.whatsapp ? <a className="mt-1 block text-sm text-slate-700 hover:underline" href={`https://wa.me/${candidate.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile</p>
            <p className="mt-2 text-sm text-slate-700">{candidate?.highestEducation || 'Education not provided'}</p>
            <p className="mt-1 text-sm text-slate-700">{candidate?.postNyscExperience ?? 'Not provided'} years post-NYSC experience</p>
            <p className="mt-1 text-sm text-slate-700">NYSC: {candidate?.nyscStatus?.replace('-', ' ') || 'Not provided'}</p>
            <p className="mt-1 text-sm text-slate-700">Profile {candidate?.profileCompletion?.percentage ?? 0}% complete</p>
          </div>
        </div>

        {candidate?._id ? (
          <Link href={`/admin-center/candidates/${candidate._id}`} className="inline-flex text-sm font-semibold text-blue-800 hover:underline">
            View full candidate profile →
          </Link>
        ) : null}

        <section>
          <h3 className="font-semibold text-slate-950">Submitted with this application</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {cv ? <a href={cv} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open submitted CV</a> : <span className="text-sm text-slate-500">No valid CV link</span>}
            {coverLetter ? <a href={coverLetter} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Open submitted cover letter</a> : null}
          </div>
          {application.note ? <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-700">{application.note}</div> : null}
          {(liveCv && liveCv !== cv) || (liveCoverLetter && liveCoverLetter !== coverLetter) ? (
            <details className="mt-4 rounded-lg border border-slate-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold">Current profile documents</summary>
              <div className="mt-3 flex gap-3 text-sm">
                {liveCv ? <a href={liveCv} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline">Current CV</a> : null}
                {liveCoverLetter ? <a href={liveCoverLetter} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline">Current cover letter</a> : null}
              </div>
            </details>
          ) : null}
        </section>

        <section>
          <label htmlFor={`stage-${applicationId}`} className="block font-semibold text-slate-950">Hiring stage</label>
          <select
            id={`stage-${applicationId}`}
            value={application.status}
            disabled={update.isPending}
            onChange={(event) => {
              const next = event.target.value as ApplicationStatus
              if (next === 'rejected') setPendingStatus(next)
              else void changeStatus(next)
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            {STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
          </select>
        </section>

        <section>
          <label htmlFor={`note-${applicationId}`} className="block font-semibold text-slate-950">Private recruiter note</label>
          <p className="mt-1 text-sm text-slate-500">Notes are append-only and never visible to candidates.</p>
          <textarea id={`note-${applicationId}`} value={note} maxLength={5000} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-slate-300 p-3" placeholder="Add useful context for the hiring team…" />
          <button type="button" onClick={() => void submitNote()} disabled={!note.trim() || addNote.isPending} className="mt-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {addNote.isPending ? 'Saving…' : 'Add private note'}
          </button>
        </section>

        <section>
          <h3 className="font-semibold text-slate-950">Activity</h3>
          {activity.isLoading ? <p role="status" className="mt-3 text-sm text-slate-500">Loading activity…</p> : null}
          <ol className="mt-3 space-y-3">
            {activities.map((item) => (
              <li key={item._id} className="border-l-2 border-slate-200 pl-4 text-sm">
                <p className="font-medium text-slate-800">
                  {item.type === 'note_added' ? 'Private note added' :
                    item.type === 'status_changed' ? `Stage changed to ${item.newStatus ? STAGES.find((stage) => stage.value === item.newStatus)?.label : ''}` :
                    item.type === 'priority_changed' ? (item.newPriority ? 'Marked as priority' : 'Priority removed') :
                    item.type === 'undo' ? 'Previous change undone' : 'Application submitted'}
                </p>
                {item.note ? <p className="mt-1 whitespace-pre-wrap text-slate-600">{item.note}</p> : null}
                <p className="mt-1 text-xs text-slate-500">{item.actor?.name || 'System'} · {formatDate(item.createdAt)}</p>
              </li>
            ))}
          </ol>
          {activity.hasNextPage ? <button type="button" onClick={() => void activity.fetchNextPage()} disabled={activity.isFetchingNextPage} className="mt-4 text-sm font-semibold text-blue-800 hover:underline">Load older activity</button> : null}
        </section>
      </div>
    </section>
  )
}
