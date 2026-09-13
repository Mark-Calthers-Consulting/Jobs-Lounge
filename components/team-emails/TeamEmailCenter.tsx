'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import {
  LuBellRing,
  LuBriefcaseBusiness,
  LuClock3,
  LuFilePenLine,
  LuMail,
  LuRefreshCw,
  LuSend,
} from 'react-icons/lu'
import { toast } from 'sonner'

import Modal from '@/components/Modal'
import PaginationControls from '@/components/PaginationControls'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import {
  useQueueTeamEmail,
  useTeamEmailHistory,
  useTeamEmailRecipients,
} from '@/hooks/useAdmin'
import type {
  TeamEmailHistoryItem,
  TeamEmailRecipient,
  TeamEmailTemplate,
} from '@/types/types'
import { formatDateInTimeZone } from '@/utils/dateTime'
import RecipientWindowSelect from './RecipientWindowSelect'

type TemplateDefinition = {
  key: TeamEmailTemplate
  title: string
  description: string
  subject?: string
  defaultMessage: string
  thresholds?: number[]
  thresholdLabel?: (value: number) => string
  icon: typeof LuMail
}

const templates: TemplateDefinition[] = [
  {
    key: 'staff-activity-reminder',
    title: 'Activity reminder',
    description: 'Reach active team members who have not used the dashboard recently.',
    subject: 'A reminder to return to Jobs Lounge',
    defaultMessage: 'It has been a while since your last visit. Please return to your dashboard when you can and review anything that may need your attention.',
    thresholds: [7, 30, 60, 90],
    thresholdLabel: (value) => `${value}+ days inactive`,
    icon: LuClock3,
  },
  {
    key: 'staff-applications-waiting',
    title: 'Applications waiting',
    description: 'Remind reviewers about Pending applications on vacancies they uploaded.',
    subject: 'Applications are waiting for your review',
    defaultMessage: 'There are candidate applications waiting for review on vacancies you uploaded. Please check the application workspace and move each submission to the appropriate stage.',
    icon: LuBellRing,
  },
  {
    key: 'staff-stale-drafts',
    title: 'Stale vacancy drafts',
    description: 'Prompt uploaders to revisit vacancy drafts that have not been edited recently.',
    subject: 'Your vacancy drafts need attention',
    defaultMessage: 'You have vacancy drafts that have not been updated recently. Please review them and either complete the listing or leave it in Draft if it is intentionally paused.',
    thresholds: [7, 14, 30],
    thresholdLabel: (value) => `${value}+ days untouched`,
    icon: LuFilePenLine,
  },
  {
    key: 'staff-closing-vacancies',
    title: 'Vacancies closing soon',
    description: 'Notify uploaders about Open vacancies approaching their deadline.',
    subject: 'Vacancies closing soon',
    defaultMessage: 'One or more vacancies you uploaded are approaching their deadline. Please review the listings and their applications before they close.',
    thresholds: [3, 7, 14],
    thresholdLabel: (value) => `Closing within ${value} days`,
    icon: LuBriefcaseBusiness,
  },
  {
    key: 'staff-custom',
    title: 'Custom email',
    description: 'Write a direct operational message to active or suspended staff.',
    defaultMessage: '',
    icon: LuMail,
  },
]

const defaultThreshold = (template: TemplateDefinition) => (
  template.key === 'staff-activity-reminder' ? 30
    : template.key === 'staff-stale-drafts' ? 14
      : template.key === 'staff-closing-vacancies' ? 7
        : undefined
)

const roleLabel = (role: TeamEmailRecipient['role']) => ({
  admin: 'Administrator',
  recruiter: 'Recruiter',
  'super-admin': 'Super administrator',
})[role]

const contextLabel = (recipient: TeamEmailRecipient) => {
  if (recipient.context.label) return recipient.context.label
  if (recipient.context.itemCount !== undefined) {
    const label = recipient.context.itemCount === 1 ? 'item needs attention' : 'items need attention'
    return `${recipient.context.itemCount} ${label}`
  }
  return 'Eligible recipient'
}

const historyStatus = (dispatch: TeamEmailHistoryItem) => {
  if (dispatch.statusCounts.dead === dispatch.recipientCount) return { label: 'Failed', tone: 'bg-red-50 text-red-700' }
  if (dispatch.statusCounts.dead > 0) return { label: 'Partially sent', tone: 'bg-amber-50 text-amber-800' }
  if (dispatch.statusCounts.pending > 0 || dispatch.statusCounts.retry > 0) return { label: 'Delivering', tone: 'bg-blue-50 text-blue-700' }
  return { label: 'Sent', tone: 'bg-emerald-50 text-emerald-700' }
}

const templateName = (key: TeamEmailTemplate) => templates.find((item) => item.key === key)?.title || key
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const parseManualRecipients = (value: string) => {
  const entered = value.split(/[\n,;]+/).map((item) => item.trim().toLowerCase()).filter(Boolean)
  const unique = [...new Set(entered)]
  if (unique.length !== entered.length) return { emails: unique, error: 'Remove duplicate email addresses.' }
  if (unique.length > 50) return { emails: unique, error: 'You can add up to 50 recipients.' }
  if (unique.some((email) => email.length > 254 || !EMAIL_PATTERN.test(email))) {
    return { emails: unique, error: 'Enter valid email addresses separated by commas or new lines.' }
  }
  return { emails: unique, error: null }
}

const previewItemText = (
  template: TeamEmailTemplate,
  item: NonNullable<TeamEmailRecipient['context']['items']>[number],
  timeZone: string,
) => {
  if (item.count !== undefined) {
    return `${item.title}: ${item.count} pending application${item.count === 1 ? '' : 's'}`
  }
  if (item.date && template === 'staff-stale-drafts') {
    return `${item.title}: last updated ${formatDateInTimeZone(item.date, timeZone)}`
  }
  if (item.date && template === 'staff-closing-vacancies') {
    return `${item.title}: closes ${formatDateInTimeZone(item.date, timeZone)}`
  }
  return item.title
}

export default function TeamEmailCenter() {
  const { timeZone } = usePlatformSettings()
  const [templateKey, setTemplateKey] = useState<TeamEmailTemplate>('staff-activity-reminder')
  const template = templates.find((item) => item.key === templateKey) || templates[0]
  const [threshold, setThreshold] = useState<number | undefined>(defaultThreshold(template))
  const [message, setMessage] = useState(template.defaultMessage)
  const [subject, setSubject] = useState('')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [page, setPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [selected, setSelected] = useState<Map<string, TeamEmailRecipient>>(new Map())
  const [previewId, setPreviewId] = useState<string>()
  const [confirming, setConfirming] = useState(false)
  const [recipientScope, setRecipientScope] = useState<'eligible' | 'all-team'>('eligible')
  const [manualRecipientInput, setManualRecipientInput] = useState('')
  const requestIdRef = useRef<string | null>(null)
  const recipientWindowOptions = template.thresholds
    ? [
      ...template.thresholds.map((value) => ({
        value: String(value),
        label: template.thresholdLabel?.(value) || String(value),
      })),
      { value: 'all-team', label: 'All active team' },
    ]
    : [
      { value: 'eligible', label: 'Matches this reminder' },
      { value: 'all-team', label: 'All active team' },
    ]

  const recipientsQuery = useTeamEmailRecipients({
    template: templateKey,
    threshold,
    search: deferredSearch || undefined,
    page,
    limit: 20,
    scope: recipientScope,
  })
  const historyQuery = useTeamEmailHistory(historyPage)
  const queueMutation = useQueueTeamEmail()
  const recipients = recipientsQuery.data?.data || []
  const selectedRecipients = useMemo(() => [...selected.values()], [selected])
  const manualResult = useMemo(
    () => parseManualRecipients(manualRecipientInput),
    [manualRecipientInput],
  )
  const manualPreviews = useMemo<TeamEmailRecipient[]>(() => manualResult.emails.map((email) => ({
    id: `manual:${email}`,
    name: 'there',
    email,
    role: 'admin',
    accountState: 'active',
    lastActiveAt: null,
    eligible: true,
    context: { label: 'Manually entered address' },
  })), [manualResult.emails])
  const previewRecipients = useMemo(
    () => [...selectedRecipients, ...manualPreviews],
    [manualPreviews, selectedRecipients],
  )
  const preview = previewRecipients.find((recipient) => recipient.id === previewId)
    || previewRecipients[0]
  const totalSelected = selected.size + manualResult.emails.length
  const manualRecipientError = manualResult.error
    || (manualResult.emails.some((email) => selectedRecipients.some((recipient) => recipient.email.toLowerCase() === email))
      ? 'A manually entered address is already selected from the team list.'
      : totalSelected > 50
        ? 'You can select up to 50 recipients in total.'
        : null)
  const canReview = totalSelected > 0
    && !manualRecipientError
    && totalSelected <= 50
    && message.trim().length > 0
    && message.trim().length <= 4000
    && (templateKey !== 'staff-custom' || (subject.trim().length >= 3 && subject.trim().length <= 150))

  useEffect(() => {
    requestIdRef.current = null
  }, [manualRecipientInput, message, recipientScope, selected, subject, templateKey, threshold])

  const chooseTemplate = (next: TemplateDefinition) => {
    setTemplateKey(next.key)
    setThreshold(defaultThreshold(next))
    setMessage(next.defaultMessage)
    setSubject('')
    setSearch('')
    setPage(1)
    setRecipientScope('eligible')
    setManualRecipientInput('')
    setSelected(new Map())
    setPreviewId(undefined)
  }

  const toggleRecipient = (recipient: TeamEmailRecipient) => {
    setSelected((current) => {
      const next = new Map(current)
      if (next.has(recipient.id)) next.delete(recipient.id)
      else if (next.size + manualResult.emails.length < 50) next.set(recipient.id, recipient)
      else toast.error('You can select up to 50 recipients.')
      return next
    })
  }

  const allPageSelected = recipients.length > 0 && recipients.every((recipient) => selected.has(recipient.id))
  const toggleCurrentPage = () => {
    setSelected((current) => {
      const next = new Map(current)
      if (allPageSelected) recipients.forEach((recipient) => next.delete(recipient.id))
      else {
        for (const recipient of recipients) {
          if (next.size + manualResult.emails.length >= 50) break
          next.set(recipient.id, recipient)
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
        template: templateKey,
        recipientIds: selectedRecipients.map((recipient) => recipient.id),
        recipientScope,
        threshold,
        message: message.trim(),
        ...(templateKey === 'staff-custom' ? {
          subject: subject.trim(),
          manualRecipients: manualResult.emails,
        } : {}),
      })
      toast.success(`${result.recipientCount} email${result.recipientCount === 1 ? '' : 's'} queued for delivery.`)
      setConfirming(false)
      requestIdRef.current = null
      setSelected(new Map())
      setPreviewId(undefined)
      if (templateKey === 'staff-custom') {
        setSubject('')
        setMessage('')
        setManualRecipientInput('')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to queue team emails')
      if (error instanceof Error && error.message.toLowerCase().includes('eligibility changed')) {
        requestIdRef.current = null
        setSelected(new Map())
        void recipientsQuery.refetch()
      }
    }
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="choose-email-heading">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#101A35] text-xs font-bold text-white">1</span>
          <div>
            <h2 id="choose-email-heading" className="text-lg font-semibold text-slate-950">Choose an email</h2>
            <p className="text-sm text-slate-600">Templates use live dashboard data when deciding who is eligible.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {templates.map((item) => {
            const Icon = item.icon
            const active = item.key === templateKey
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                onClick={() => chooseTemplate(item)}
                className={`min-h-40 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${active ? 'border-blue-700 bg-blue-50/70' : 'border-slate-200 bg-white hover:border-slate-400'}`}
              >
                <Icon aria-hidden="true" className={`text-xl ${active ? 'text-blue-700' : 'text-slate-500'}`} />
                <span className="mt-5 block text-sm font-semibold text-slate-950">{item.title}</span>
                <span className="mt-1.5 block text-xs leading-5 text-slate-600">{item.description}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="select-recipients-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#101A35] text-xs font-bold text-white">2</span>
            <div>
              <h2 id="select-recipients-heading" className="text-lg font-semibold text-slate-950">Select recipients</h2>
              <p className="text-sm text-slate-600">
                {templateKey === 'staff-custom'
                  ? 'Choose team members or add email addresses manually.'
                  : recipientScope === 'eligible'
                    ? `Showing team members who currently match ${template.title.toLowerCase()}.`
                    : 'Showing all active team members, including people outside the current criteria.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {templateKey !== 'staff-custom' ? (
              <RecipientWindowSelect
                options={recipientWindowOptions}
                value={recipientScope === 'all-team' ? 'all-team' : String(threshold ?? 'eligible')}
                onChange={(nextValue) => {
                    const showAll = nextValue === 'all-team'
                    setRecipientScope(showAll ? 'all-team' : 'eligible')
                    if (!showAll && template.thresholds) setThreshold(Number(nextValue))
                    setPage(1)
                    setSelected(new Map())
                    setPreviewId(undefined)
                }}
              />
            ) : null}
            <label className="text-xs font-semibold text-slate-700">
              Search team
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                placeholder="Name or email"
                className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-normal sm:w-64"
              />
            </label>
          </div>
        </div>

        {templateKey === 'staff-custom' ? (
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <label htmlFor="manual-team-email-recipients" className="text-sm font-semibold text-slate-800">Add email addresses manually</label>
            <p className="mt-1 text-xs leading-5 text-slate-600">Separate addresses with commas or new lines. These addresses do not need to belong to a Jobs Lounge account.</p>
            <textarea
              id="manual-team-email-recipients"
              value={manualRecipientInput}
              onChange={(event) => setManualRecipientInput(event.target.value)}
              rows={3}
              placeholder={'name@example.com\nanother@example.com'}
              aria-describedby={manualRecipientError ? 'manual-team-email-error' : undefined}
              className="mt-3 w-full rounded-md border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-950 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <div className="mt-1 flex items-start justify-between gap-3 text-xs">
              {manualRecipientError ? <p id="manual-team-email-error" role="alert" className="text-red-700">{manualRecipientError}</p> : <span />}
              <span className="shrink-0 text-slate-500">{manualResult.emails.length} manual</span>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm">
          <button type="button" onClick={toggleCurrentPage} disabled={!recipients.length} className="font-semibold text-blue-700 disabled:text-slate-400">
            {allPageSelected ? 'Clear this page' : 'Select this page'}
          </button>
          <span aria-live="polite" className="text-slate-600">{totalSelected} of 50 selected</span>
        </div>

        {recipientsQuery.isLoading ? (
          <div className="space-y-3 p-5" role="status" aria-label="Loading eligible recipients">
            {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-md bg-slate-100" />)}
          </div>
        ) : recipientsQuery.isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-700">Unable to load eligible recipients.</p>
            <button type="button" onClick={() => void recipientsQuery.refetch()} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><LuRefreshCw /> Try again</button>
          </div>
        ) : recipients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-900">No eligible team members found</p>
            <p className="mt-1 text-sm text-slate-600">Try another threshold or clear the search.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {recipients.map((recipient) => (
              <li key={recipient.id}>
                <label className="grid cursor-pointer gap-3 px-5 py-4 hover:bg-slate-50 sm:grid-cols-[auto_1fr_0.65fr_0.55fr_1fr] sm:items-center">
                  <input
                    type="checkbox"
                    aria-label={`Select ${recipient.name}`}
                    checked={selected.has(recipient.id)}
                    onChange={() => toggleRecipient(recipient)}
                    className="size-4 accent-blue-700"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">{recipient.name}</span>
                    <span className="block text-xs text-slate-500">{recipient.email}</span>
                  </span>
                  <span className="text-sm text-slate-600">{roleLabel(recipient.role)}</span>
                  <span className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${recipient.accountState === 'suspended' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
                    {recipient.accountState === 'suspended' ? 'Suspended' : 'Active'}
                  </span>
                  <span className={`text-sm ${recipient.eligible ? 'text-slate-600' : 'font-medium text-amber-800'}`}>{contextLabel(recipient)}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <PaginationControls pagination={recipientsQuery.data?.pagination} onPageChange={setPage} />
      </section>

      <section aria-labelledby="review-email-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#101A35] text-xs font-bold text-white">3</span>
          <div>
            <h2 id="review-email-heading" className="text-lg font-semibold text-slate-950">Review and send</h2>
            <p className="text-sm text-slate-600">Edit the message, then check its personalized preview.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-5">
            <div>
              <label htmlFor="team-email-subject" className="block text-sm font-semibold text-slate-800">Subject</label>
              <input
                id="team-email-subject"
                value={templateKey === 'staff-custom' ? subject : (template.subject || '')}
                onChange={(event) => setSubject(event.target.value)}
                disabled={templateKey !== 'staff-custom'}
                maxLength={150}
                className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal text-slate-950 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>
            <div>
              <label htmlFor="team-email-message" className="block text-sm font-semibold text-slate-800">Message</label>
              <textarea
                id="team-email-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={4000}
                rows={8}
                placeholder="Write the message recipients should receive."
                className="mt-2 w-full rounded-md border border-slate-300 p-3 font-normal leading-6 text-slate-950"
              />
              <span className="mt-1 block text-right text-xs font-normal text-slate-500">{message.length}/4000</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-slate-950">Recipient preview</h3>
              {previewRecipients.length > 1 ? (
                <select value={preview?.id || ''} onChange={(event) => setPreviewId(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  {previewRecipients.map((recipient) => <option key={recipient.id} value={recipient.id}>{recipient.name === 'there' ? recipient.email : recipient.name}</option>)}
                </select>
              ) : null}
            </div>
            {preview ? (
              <div className="pt-5 text-sm leading-6 text-slate-700">
                <p className="font-semibold text-slate-950">{templateKey === 'staff-custom' ? subject || 'Your subject' : template.subject}</p>
                <p className="mt-5">Hello {preview.name || 'there'},</p>
                <p className="mt-3 whitespace-pre-line">{message || 'Your message will appear here.'}</p>
                {templateKey !== 'staff-custom' && templateKey !== 'staff-activity-reminder' ? (
                  <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">Added automatically</p>
                    {preview.context.items?.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {preview.context.items.map((item) => (
                          <li key={item.jobId}>{previewItemText(templateKey, item, timeZone)}</li>
                        ))}
                      </ul>
                    ) : <p className="mt-2 text-amber-800">No live items currently match this reminder.</p>}
                  </div>
                ) : null}
                {templateKey !== 'staff-custom' ? (
                  <div className="mt-5 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600">
                    The email includes a clear link to log in to the team dashboard.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex min-h-56 items-center justify-center text-center text-sm text-slate-500">Select at least one recipient to preview the email.</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">Messages are queued and delivered by the email worker.</p>
          <button type="button" disabled={!canReview || queueMutation.isPending} onClick={() => setConfirming(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#101A35] px-5 text-sm font-semibold text-white hover:bg-[#172447] disabled:cursor-not-allowed disabled:opacity-50">
            <LuSend aria-hidden="true" /> {totalSelected ? `Review ${totalSelected} email${totalSelected === 1 ? '' : 's'}` : 'Review email'}
          </button>
        </div>
      </section>

      <section aria-labelledby="email-history-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <h2 id="email-history-heading" className="text-lg font-semibold text-slate-950">Recent email activity</h2>
          <p className="text-sm text-slate-600">Delivery status for team emails queued during the last 30 days.</p>
        </div>
        {historyQuery.isLoading ? <div className="h-36 animate-pulse bg-slate-50" role="status" aria-label="Loading email activity" />
          : historyQuery.isError ? (
            <div className="p-8 text-center"><p className="text-sm text-red-700">Unable to load recent email activity.</p><button type="button" onClick={() => void historyQuery.refetch()} className="mt-3 text-sm font-semibold text-blue-700">Try again</button></div>
          ) : !historyQuery.data?.data.length ? (
            <div className="p-10 text-center text-sm text-slate-600">No team emails have been queued in the last 30 days.</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {historyQuery.data.data.map((dispatch) => {
                const status = historyStatus(dispatch)
                return (
                  <li key={dispatch.dispatchId} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{templateName(dispatch.template)}</p>
                      <p className="text-xs text-slate-500">Queued by {dispatch.requestedByName || 'Super administrator'} · {formatDateInTimeZone(dispatch.queuedAt, timeZone, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      {dispatch.latestDeliveryAt ? <p className="text-xs text-slate-500">Latest delivery {formatDateInTimeZone(dispatch.latestDeliveryAt, timeZone, { dateStyle: 'medium', timeStyle: 'short' })}</p> : null}
                    </div>
                    <div><p className="text-sm text-slate-700">{dispatch.recipientPreview.join(', ')}{dispatch.recipientCount > dispatch.recipientPreview.length ? ` +${dispatch.recipientCount - dispatch.recipientPreview.length}` : ''}</p><p className="text-xs text-slate-500">{dispatch.statusCounts.sent} sent · {dispatch.statusCounts.pending} queued · {dispatch.statusCounts.retry} retrying · {dispatch.statusCounts.dead} failed</p></div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
                  </li>
                )
              })}
            </ul>
          )}
        <PaginationControls pagination={historyQuery.data?.pagination} onPageChange={setHistoryPage} />
      </section>

      <Modal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onSubmit={() => void send()}
        title="Queue team emails?"
        actionLabel={queueMutation.isPending ? 'Queueing…' : `Queue ${totalSelected} email${totalSelected === 1 ? '' : 's'}`}
        disabled={queueMutation.isPending}
        actionDisabled={!canReview}
        size="compact"
        body={(
          <div className="space-y-3 text-sm leading-6 text-slate-200">
            <p><strong className="text-white">{template.title}</strong> will be sent to {totalSelected} recipient{totalSelected === 1 ? '' : 's'}.</p>
            {selectedRecipients.some((recipient) => !recipient.eligible) ? <p>Some selected team members are outside this reminder&apos;s current criteria.</p> : null}
            <p>The messages will be queued immediately. Delivery progress will appear in Recent email activity.</p>
          </div>
        )}
      />
    </div>
  )
}
