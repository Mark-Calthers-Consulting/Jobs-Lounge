'use client'

import { useEffect, useRef, useState } from 'react'
import { LuArchive, LuEye, LuMegaphone, LuPencil, LuPlus, LuSend, LuX } from 'react-icons/lu'
import PaginationControls from '@/components/PaginationControls'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import {
  useArchiveTeamAnnouncement,
  useCreateTeamAnnouncement,
  useTeamAnnouncements,
  useUpdateTeamAnnouncement,
} from '@/hooks/useTeamNotifications'
import type {
  TeamAnnouncement,
  TeamAnnouncementPayload,
  TeamAnnouncementPriority,
  TeamAnnouncementType,
} from '@/types/types'
import { dateTimeInputToUtc, dateTimeInputValueInTimeZone, formatDateInTimeZone } from '@/utils/dateTime'
import { announcementTypeTone } from './announcementStyles'

const types: TeamAnnouncementType[] = ['General', 'Feature update', 'Maintenance', 'Action required']

type FormState = {
  title: string
  message: string
  type: TeamAnnouncementType
  priority: TeamAnnouncementPriority
  actionLabel: string
  actionHref: string
  expiresAt: string
}

const emptyForm: FormState = {
  title: '',
  message: '',
  type: 'General',
  priority: 'Normal',
  actionLabel: '',
  actionHref: '',
  expiresAt: '',
}

type Confirmation =
  | { action: 'publish'; existing?: TeamAnnouncement }
  | { action: 'archive'; existing: TeamAnnouncement }
  | null

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong'

const ConfirmationDialog = ({
  confirmation,
  pending,
  onClose,
  onConfirm,
}: {
  confirmation: Exclude<Confirmation, null>
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, pending])

  const publishing = confirmation.action === 'publish'
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="announcement-confirmation-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="announcement-confirmation-title" className="text-xl font-semibold text-slate-950">{publishing ? 'Publish this announcement?' : 'Archive this announcement?'}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{publishing ? 'It will become visible to every active team member and cannot be edited after publishing.' : 'It will stop appearing in team notifications. This action does not delete its history.'}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" disabled={pending} onClick={onClose} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-60">Cancel</button>
          <button type="button" disabled={pending} onClick={onConfirm} className={`min-h-11 rounded-lg px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-60 ${publishing ? 'bg-slate-950 hover:bg-slate-800' : 'bg-red-700 hover:bg-red-800'}`}>{pending ? 'Working…' : publishing ? 'Publish announcement' : 'Archive announcement'}</button>
        </div>
      </section>
    </div>
  )
}

export default function AnnouncementManager() {
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<TeamAnnouncement | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const { timeZone } = usePlatformSettings()
  const announcements = useTeamAnnouncements(page)
  const create = useCreateTeamAnnouncement()
  const update = useUpdateTeamAnnouncement()
  const archive = useArchiveTeamAnnouncement()
  const saving = create.isPending || update.isPending

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
    setClientError(null)
    setFeedback(null)
  }

  const reset = () => {
    setForm(emptyForm)
    setEditing(null)
    setClientError(null)
  }

  const payload = (status: 'Draft' | 'Published'): TeamAnnouncementPayload | null => {
    const title = form.title.trim()
    const message = form.message.trim()
    const actionLabel = form.actionLabel.trim()
    const actionHref = form.actionHref.trim()
    if (!title || !message) {
      setClientError('Add a title and message before saving.')
      return null
    }
    if (title.length > 120 || message.length > 1200) {
      setClientError('Keep the title within 120 characters and the message within 1,200 characters.')
      return null
    }
    if ((actionLabel && !actionHref) || (!actionLabel && actionHref)) {
      setClientError('Add both the action label and internal path, or leave both blank.')
      return null
    }
    if (actionHref && !/^\/(?!\/)/.test(actionHref)) {
      setClientError('The action must use an internal path such as /admin-center/jobs.')
      return null
    }
    const expiresAt = form.expiresAt ? dateTimeInputToUtc(form.expiresAt, timeZone) : null
    if (form.expiresAt && (!expiresAt || new Date(expiresAt) <= new Date())) {
      setClientError('Choose a valid future expiry time.')
      return null
    }
    return {
      title,
      message,
      type: form.type,
      priority: form.priority,
      status,
      actionLabel,
      actionHref,
      expiresAt: expiresAt || null,
    }
  }

  const save = async (status: 'Draft' | 'Published') => {
    const data = payload(status)
    if (!data) return
    try {
      if (editing) await update.mutateAsync({ announcementId: editing._id, ...data })
      else await create.mutateAsync(data)
      setFeedback(status === 'Published' ? 'Announcement published to the team.' : 'Draft saved.')
      reset()
      setConfirmation(null)
    } catch (error) {
      setClientError(errorMessage(error))
      setConfirmation(null)
    }
  }

  const beginEdit = (announcement: TeamAnnouncement) => {
    setEditing(announcement)
    setForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      actionLabel: announcement.action?.label || '',
      actionHref: announcement.action?.href || '',
      expiresAt: announcement.expiresAt
        ? dateTimeInputValueInTimeZone(new Date(announcement.expiresAt), timeZone)
        : '',
    })
    setClientError(null)
    setFeedback(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmArchive = async () => {
    if (confirmation?.action !== 'archive') return
    try {
      await archive.mutateAsync(confirmation.existing._id)
      if (editing?._id === confirmation.existing._id) reset()
      setFeedback('Announcement archived.')
      setConfirmation(null)
    } catch (error) {
      setClientError(errorMessage(error))
      setConfirmation(null)
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-blue-800">Team communication</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Announcements</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Publish short operational updates to active admins and recruiters.</p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <section aria-labelledby="composer-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="composer-heading" className="text-xl font-semibold text-slate-950">{editing ? 'Edit draft' : 'Create announcement'}</h2>
              <p className="mt-1 text-sm text-slate-500">Keep it focused. Published announcements cannot be edited.</p>
            </div>
            {editing ? <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950"><LuX aria-hidden="true" />Cancel edit</button> : null}
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="announcement-title" className="block text-sm font-semibold text-slate-900">Title</label>
              <input id="announcement-title" value={form.title} onChange={(event) => setField('title', event.target.value)} maxLength={120} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="What does the team need to know?" />
              <p className="mt-1 text-right text-xs text-slate-500">{form.title.length}/120</p>
            </div>
            <div>
              <label htmlFor="announcement-message" className="block text-sm font-semibold text-slate-900">Message</label>
              <textarea id="announcement-message" value={form.message} onChange={(event) => setField('message', event.target.value)} maxLength={1200} rows={7} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 leading-6 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="Write a clear, concise update." />
              <p className="mt-1 text-right text-xs text-slate-500">{form.message.length}/1,200</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="announcement-type" className="block text-sm font-semibold text-slate-900">Type</label>
                <select id="announcement-type" value={form.type} onChange={(event) => setField('type', event.target.value as TeamAnnouncementType)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100">
                  {types.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="announcement-priority" className="block text-sm font-semibold text-slate-900">Priority</label>
                <select id="announcement-priority" value={form.priority} onChange={(event) => setField('priority', event.target.value as TeamAnnouncementPriority)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100">
                  <option>Normal</option><option>Important</option>
                </select>
                <p className="mt-1 text-xs leading-5 text-slate-500">Important updates open once as a modal.</p>
              </div>
            </div>
            <fieldset className="rounded-lg border border-slate-200 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">Optional action</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="announcement-action-label" className="block text-sm font-medium text-slate-700">Button label</label><input id="announcement-action-label" value={form.actionLabel} maxLength={40} onChange={(event) => setField('actionLabel', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="Review applications" /></div>
                <div><label htmlFor="announcement-action-path" className="block text-sm font-medium text-slate-700">Internal path</label><input id="announcement-action-path" value={form.actionHref} maxLength={240} onChange={(event) => setField('actionHref', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" placeholder="/admin-center/applications" /></div>
              </div>
            </fieldset>
            <div>
              <label htmlFor="announcement-expiry" className="block text-sm font-semibold text-slate-900">Expiry <span className="font-normal text-slate-500">(optional)</span></label>
              <input id="announcement-expiry" type="datetime-local" value={form.expiresAt} onChange={(event) => setField('expiresAt', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 sm:max-w-sm" />
              <p className="mt-1 text-xs text-slate-500">Uses the organization time zone: {timeZone}.</p>
            </div>
          </div>

          {clientError ? <p role="alert" className="mt-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">{clientError}</p> : null}
          {feedback ? <p role="status" className="mt-5 border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p> : null}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button type="button" disabled={saving} onClick={() => void save('Draft')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-60"><LuPlus aria-hidden="true" />{saving ? 'Saving…' : 'Save draft'}</button>
            <button type="button" disabled={saving} onClick={() => { if (payload('Published')) setConfirmation({ action: 'publish', existing: editing || undefined }) }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-60"><LuSend aria-hidden="true" />Publish</button>
          </div>
        </section>

        <aside aria-labelledby="preview-heading" className="sticky top-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><LuEye aria-hidden="true" /><h2 id="preview-heading">Live preview</h2></div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap gap-2"><span className={`rounded px-2 py-1 text-xs font-semibold ${announcementTypeTone[form.type]}`}>{form.type}</span>{form.priority === 'Important' ? <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-800">Important</span> : null}</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">{form.title.trim() || 'Announcement title'}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{form.message.trim() || 'Your message will appear here.'}</p>
            {form.actionLabel.trim() && form.actionHref.trim() ? <span className="mt-4 inline-flex rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">{form.actionLabel.trim()}</span> : null}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Only plain text is shown. Everyone on the active team receives the same announcement.</p>
        </aside>
      </div>

      <section aria-labelledby="announcement-history-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4"><h2 id="announcement-history-heading" className="text-lg font-semibold text-slate-950">Announcement history</h2><p className="mt-1 text-sm text-slate-500">Draft, live, expired, and archived updates.</p></div>
        {announcements.isLoading ? <div role="status" aria-label="Loading announcements" className="space-y-3 p-5">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-100" />)}</div>
          : announcements.isError ? <div className="p-10 text-center"><p className="font-medium text-slate-950">Announcements could not be loaded.</p><button type="button" onClick={() => announcements.refetch()} className="mt-3 text-sm font-semibold text-blue-800 hover:underline">Try again</button></div>
          : announcements.data?.data.length ? <><ul className="divide-y divide-slate-100">{announcements.data.data.map((announcement) => {
            const displayStatus = announcement.status === 'Published'
              ? (announcement.expiresAt && new Date(announcement.expiresAt) <= new Date() ? 'Expired' : 'Live')
              : announcement.status
            return (
            <li key={announcement._id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded px-2 py-1 text-xs font-semibold ${announcementTypeTone[announcement.type]}`}>{announcement.type}</span><span className="text-xs font-semibold text-slate-500">{displayStatus}</span></div><h3 className="mt-2 truncate font-semibold text-slate-950">{announcement.title}</h3><p className="mt-1 text-xs text-slate-500">Created by {announcement.createdBy.name} · {formatDateInTimeZone(announcement.createdAt, timeZone)}</p></div>
              <div className="flex shrink-0 gap-2">{announcement.status === 'Draft' ? <button type="button" onClick={() => beginEdit(announcement)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"><LuPencil aria-hidden="true" />Edit</button> : null}{announcement.status !== 'Archived' ? <button type="button" onClick={() => setConfirmation({ action: 'archive', existing: announcement })} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"><LuArchive aria-hidden="true" />Archive</button> : null}</div>
            </li>
          )})}</ul><PaginationControls pagination={announcements.data.pagination} onPageChange={setPage} /></>
          : <div className="px-5 py-14 text-center"><LuMegaphone aria-hidden="true" className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-medium text-slate-950">No announcements yet</p><p className="mt-1 text-sm text-slate-500">Create a draft or publish your first team update.</p></div>}
      </section>

      {confirmation ? <ConfirmationDialog confirmation={confirmation} pending={saving || archive.isPending} onClose={() => setConfirmation(null)} onConfirm={() => confirmation.action === 'publish' ? void save('Published') : void confirmArchive()} /> : null}
    </div>
  )
}
