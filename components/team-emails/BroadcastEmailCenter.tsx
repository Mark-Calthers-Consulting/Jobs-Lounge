'use client'

import { useDeferredValue, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Modal from '@/components/Modal'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { dateTimeInputToUtc, formatDateInTimeZone } from '@/utils/dateTime'
import { dispatchData, dispatchRequest, type AudienceFilters, type BroadcastDraft, type BroadcastTemplate, type ContentOptions, type Delivery, type Dispatch, type EmailChannel, type EmailSelection, type Paging, type RecipientResult, type Review } from '@/api/emailDispatches'

const templates: { key: BroadcastTemplate; title: string; description: string; subject: string; message: string }[] = [
  { key: 'candidate-message', title: 'Custom message', description: 'Write a general update to your selected audience.', subject: '', message: '' },
  { key: 'candidate-profile', title: 'Complete your profile', description: 'Help people with incomplete profiles put their best foot forward.', subject: 'A little more about you', message: 'A complete profile helps recruiters understand your experience and strengths. When you have a moment, you can add the missing details to your Jobs Lounge profile.' },
  { key: 'candidate-cv', title: 'Add your CV', description: 'Reach people who do not yet have a usable CV link.', subject: 'Your next step on Jobs Lounge', message: 'Adding your CV makes it easier to apply when the right opportunity comes along. You can upload it to Google Drive, enable viewing for anyone with the link, and add the link to your profile.' },
  { key: 'candidate-activity', title: 'Activity check-in', description: 'A gentle invitation to explore opportunities again.', subject: 'Ready for your next opportunity?', message: 'There may be a role worth exploring on Jobs Lounge. Whenever you are ready, take a look at the latest opportunities and find one that fits your next step.' },
  { key: 'candidate-roundup', title: 'Vacancy roundup', description: 'Share up to six opportunities with people who enabled vacancy alerts.', subject: 'Opportunities worth a look', message: 'Here are a few opportunities you might like to explore. Follow each link to learn more about the role and its available locations.' },
  { key: 'candidate-newsletter', title: 'Career newsletter', description: 'Career Insights and opportunities for newsletter subscribers.', subject: 'Your Jobs Lounge career update', message: 'Explore fresh perspectives and opportunities for your next career step.' },
]
const control = 'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const button = 'rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
const initialDraft = (channel: EmailChannel): BroadcastDraft => {
  const template = templates.find((item) => item.key === (channel === 'newsletter' ? 'candidate-newsletter' : 'candidate-message'))!
  return { channel, template: template.key, content: { subject: template.subject, message: template.message, preheader: '', closing: '', articleIds: [], vacancyIds: [] }, filters: {}, selection: { mode: 'explicit', ids: [], excludeIds: [] }, includeTeam: false }
}
export const selectedCount = (selection: EmailSelection, total: number) => selection.mode === 'all' ? Math.max(0, total - selection.excludeIds.length) : selection.ids.length

export default function BroadcastEmailCenter({ channel, superAdmin }: { channel: EmailChannel; superAdmin: boolean }) {
  const [draft, setDraft] = useState(() => initialDraft(channel))
  const [saved, setSaved] = useState<Dispatch | null>(null)
  const [step, setStep] = useState(0)
  const [page, setPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [review, setReview] = useState<Review | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [schedule, setSchedule] = useState('')
  const [mobile, setMobile] = useState(false)
  const [detail, setDetail] = useState<string | null>(null)
  const [detailPage, setDetailPage] = useState(1)
  const [articleSearch, setArticleSearch] = useState('')
  const [vacancySearch, setVacancySearch] = useState('')
  const contentSearch = { articleSearch: useDeferredValue(articleSearch), vacancySearch: useDeferredValue(vacancySearch) }
  const settings = usePlatformSettings()
  const client = useQueryClient()
  const audience = useQuery({ queryKey: ['broadcast-recipients', draft.template, draft.filters, draft.includeTeam, page], queryFn: () => dispatchRequest<RecipientResult>('/recipients', 'POST', { template: draft.template, filters: draft.filters, includeTeam: draft.includeTeam, page, limit: 20 }), enabled: step > 0 })
  const options = useQuery({ queryKey: ['broadcast-content-options', contentSearch.articleSearch, contentSearch.vacancySearch], queryFn: () => dispatchData<ContentOptions>(`/options?${new URLSearchParams(contentSearch)}`) })
  const history = useQuery({ queryKey: ['broadcast-history', channel, historyPage], queryFn: () => dispatchRequest<{ data: Dispatch[]; pagination: Paging }>(`?channel=${channel}&page=${historyPage}`), refetchInterval: (query) => query.state.data?.data.some((item) => ['queued', 'scheduled'].includes(item.state)) ? 10000 : false })
  const deliveries = useQuery({ queryKey: ['broadcast-deliveries', detail, detailPage], queryFn: () => dispatchRequest<{ data: Delivery[]; pagination: Paging }>(`/${detail}/deliveries?page=${detailPage}`), enabled: Boolean(detail), refetchInterval: (query) => query.state.data?.data.some((item) => ['pending', 'processing', 'retry'].includes(item.status)) ? 10000 : false })
  const count = selectedCount(draft.selection, audience.data?.pagination.total || 0)
  const change = (next: BroadcastDraft) => { setDraft(next); setReview(null); setRequestId(''); setError('') }
  const filter = (key: keyof AudienceFilters, value: string | number | undefined) => {
    const filters = { ...draft.filters }
    if (value === undefined || value === '') delete filters[key]
    else Object.assign(filters, { [key]: value })
    change({ ...draft, filters, selection: { mode: 'explicit', ids: [], excludeIds: [] } }); setPage(1)
  }
  const selectPerson = (id: string, checked: boolean) => {
    const selection = draft.selection
    const key = selection.mode === 'all' ? 'excludeIds' : 'ids'
    const add = selection.mode === 'all' ? !checked : checked
    const next = new Set(selection[key]); if (add) next.add(id); else next.delete(id)
    if (key === 'ids' && next.size > 1000) { toast.error('Select no more than 1,000 people'); return }
    change({ ...draft, selection: { ...selection, [key]: [...next] } })
  }
  const isSelected = (id: string) => draft.selection.mode === 'all' ? !draft.selection.excludeIds.includes(id) : draft.selection.ids.includes(id)
  const save = async () => {
    const result = await dispatchData<Dispatch>(saved ? `/${saved._id}` : '', saved ? 'PATCH' : 'POST', { ...draft, ...(saved ? { revision: saved.revision } : {}) })
    setSaved(result); await client.invalidateQueries({ queryKey: ['broadcast-history'] }); return result
  }
  const act = async (action: () => Promise<void>) => {
    setBusy(true); setError('')
    try { await action() } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to complete this request. Your message has been kept.') } finally { setBusy(false) }
  }
  const reviewEmail = () => act(async () => {
    const stored = await save()
    setReview(await dispatchData<Review>(`/${stored._id}/preview`, 'POST', {})); setRequestId(crypto.randomUUID()); setStep(2)
  })
  const send = () => act(async () => {
    if (!saved || !review) return
    const when = schedule ? dateTimeInputToUtc(schedule, settings.timeZone) : null
    if (schedule && !when) throw new Error('Choose a valid delivery time')
    const result = await dispatchData<Dispatch>(`/${saved._id}/send`, 'POST', { requestId, fingerprint: review.fingerprint, ...(when ? { scheduledFor: when } : {}) })
    toast.success(result.state === 'scheduled' ? 'Email scheduled' : 'Email queued')
    setConfirm(false); setDraft(initialDraft(channel)); setSaved(null); setReview(null); setSchedule(''); setStep(0)
    await client.invalidateQueries({ queryKey: ['broadcast-history'] })
    await client.invalidateQueries({ queryKey: ['email-analytics'] })
  })
  const choose = (key: BroadcastTemplate) => {
    const template = templates.find((item) => item.key === key)!
    change({ ...initialDraft(channel), template: key, content: { ...initialDraft(channel).content, subject: template.subject, message: template.message } }); setSaved(null)
  }
  const activeFilters = Object.entries(draft.filters).filter(([, value]) => value !== '' && value !== undefined)
  return <div className="space-y-8">
    <fieldset disabled={busy} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
      <legend className="sr-only">{channel === 'newsletter' ? 'Newsletter composer' : 'Candidate email composer'}</legend>
      <ol aria-label="Email composition steps" className="mb-7 flex flex-wrap gap-x-7 gap-y-3 border-b border-slate-200 pb-5 text-sm">
        {['Choose email', 'Select recipients', 'Review and send'].map((label, index) => <li key={label}><button type="button" disabled={busy || (index === 2 && !review)} aria-current={step === index ? 'step' : undefined} className={`flex items-center gap-2 font-semibold focus-visible:outline-2 focus-visible:outline-blue-700 ${step === index ? 'text-blue-800' : 'text-slate-500'}`} onClick={() => setStep(index)}><span className={`grid size-6 place-items-center rounded-full ${step === index ? 'bg-blue-50' : 'bg-slate-100'}`}>{index + 1}</span>{label}</button></li>)}
      </ol>
      {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error} <span className="block mt-1">Your composition has been kept. If eligibility changed, refresh recipients and review again.</span></p>}
      {step === 0 && <div className="space-y-6">
        {channel === 'candidate' && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="group" aria-label="Choose email template">{templates.filter((item) => item.key !== 'candidate-newsletter').map((item) => <button type="button" key={item.key} aria-pressed={draft.template === item.key} onClick={() => choose(item.key)} className={`rounded-lg border p-4 text-left focus-visible:outline-2 focus-visible:outline-blue-700 ${draft.template === item.key ? 'border-blue-700 bg-blue-50/40' : 'border-slate-200 hover:border-slate-400'}`}><span className="block font-semibold text-slate-950">{item.title}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{item.description}</span></button>)}</div>}
        <label className="block text-sm font-semibold text-slate-800">Subject<input className={control} minLength={3} maxLength={150} value={draft.content.subject} onChange={(event) => change({ ...draft, content: { ...draft.content, subject: event.target.value } })} /></label>
        {channel === 'newsletter' && <label className="block text-sm font-semibold text-slate-800">Preheader <span className="font-normal text-slate-500">(optional)</span><input className={control} maxLength={200} value={draft.content.preheader} onChange={(event) => change({ ...draft, content: { ...draft.content, preheader: event.target.value } })} /></label>}
        <label className="block text-sm font-semibold text-slate-800">{channel === 'newsletter' ? 'Introduction' : 'Message'}<textarea className={control} rows={5} maxLength={4000} value={draft.content.message} onChange={(event) => change({ ...draft, content: { ...draft.content, message: event.target.value } })} /><span className="mt-1 block font-normal text-slate-500">Plain text only. Greetings, context, links and unsubscribe details are added automatically.</span></label>
        {(channel === 'newsletter' || draft.template === 'candidate-roundup') && <div className="grid gap-5 lg:grid-cols-2">
          {channel === 'newsletter' && <label className="text-sm font-semibold">Search published articles<input className={control} maxLength={100} value={articleSearch} onChange={(event) => setArticleSearch(event.target.value)} /></label>}
          <label className="text-sm font-semibold">Search public opportunities<input className={control} maxLength={100} value={vacancySearch} onChange={(event) => setVacancySearch(event.target.value)} /></label>
          {options.isPending && <p role="status">Loading published content…</p>}
          {options.isError && <p role="alert">Unable to load published content. <button className={button} onClick={() => void options.refetch()}>Retry</button></p>}
          {(channel === 'newsletter' ? ['articleIds', 'vacancyIds'] as const : ['vacancyIds'] as const).map((key) => <fieldset key={key} className="rounded-lg border border-slate-200 p-4"><legend className="px-1 text-sm font-semibold">{key === 'articleIds' ? 'Career Insights · up to 3' : 'Public opportunities · up to 6'}</legend><div className="max-h-60 space-y-3 overflow-auto">{(key === 'articleIds' ? options.data?.articles : options.data?.vacancies)?.map((item) => <label key={item._id} className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 size-4 accent-blue-700" checked={draft.content[key].includes(item._id)} disabled={!draft.content[key].includes(item._id) && draft.content[key].length >= (key === 'articleIds' ? 3 : 6)} onChange={(event) => change({ ...draft, content: { ...draft.content, [key]: event.target.checked ? [...draft.content[key], item._id] : draft.content[key].filter((id) => id !== item._id) } })} />{item.title}{'locations' in item && Array.isArray(item.locations) && <span className="text-slate-500"> · {item.locations.join(', ')}</span>}</label>)}{options.data && !(key === 'articleIds' ? options.data.articles : options.data.vacancies).length && <p className="text-sm text-slate-500">No published content available.</p>}</div></fieldset>)}
        </div>}
        {channel === 'newsletter' && <label className="block text-sm font-semibold">Closing message <span className="font-normal text-slate-500">(optional)</span><textarea className={control} rows={3} maxLength={1000} value={draft.content.closing} onChange={(event) => change({ ...draft, content: { ...draft.content, closing: event.target.value } })} /></label>}
        <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => void act(async () => { await save(); toast.success('Draft saved') })}>Save draft</button><button className={`${button} !bg-slate-950 !text-white`} disabled={!draft.content.subject.trim() || !draft.content.message.trim()} onClick={() => setStep(1)}>Select recipients →</button></div>
      </div>}
      {step === 1 && <div className="space-y-5">
        <p className="text-sm text-slate-600">{superAdmin ? 'Find candidate accounts, including registered users without applications.' : 'Only applicants to your own non-archived vacancies are available.'} Different filters combine with AND. Opted-out recipients are excluded.</p>
        <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold">Search name or email<input className={control} maxLength={100} value={draft.filters.search || ''} onChange={(event) => filter('search', event.target.value)} /></label>
          <label className="text-sm font-semibold">Joined<select className={control} value={draft.filters.joinedFrom || draft.filters.joinedTo ? 'custom' : draft.filters.joinedDays || ''} onChange={(event) => { const value = event.target.value; change({ ...draft, filters: { ...draft.filters, joinedDays: value && value !== 'custom' ? Number(value) : undefined, joinedFrom: value === 'custom' ? new Date().toISOString().slice(0, 10) : undefined, joinedTo: undefined }, selection: { mode: 'explicit', ids: [], excludeIds: [] } }); setPage(1) }}><option value="">Any time</option>{[7, 30, 60, 90].map((days) => <option value={days} key={days}>Within {days} days</option>)}<option value="custom">Custom date range</option></select></label>
          <label className="text-sm font-semibold">Last active<select className={control} value={draft.filters.activity === 'unknown' ? 'unknown' : draft.filters.activityDays ? `${draft.filters.activity}:${draft.filters.activityDays}` : ''} onChange={(event) => { const [activity, days] = event.target.value.split(':'); change({ ...draft, filters: { ...draft.filters, activity: activity || undefined, activityDays: days ? Number(days) : undefined }, selection: { mode: 'explicit', ids: [], excludeIds: [] } }); setPage(1) }}><option value="">Any time</option>{['active', 'inactive'].flatMap((type) => [7, 30, 60, 90].map((days) => <option value={`${type}:${days}`} key={`${type}:${days}`}>{type === 'active' ? `Active within ${days} days` : `Inactive for at least ${days} days`}</option>))}<option value="unknown">No recorded activity</option></select></label>
          {superAdmin && <FilterSelect label="Account group" value={draft.filters.group} onChange={(value) => filter('group', value)} choices={[['', 'All accounts'], ['applicants', 'Applicants'], ['registered', 'Registered users without applications']]} />}
          <FilterSelect label="Profile" value={draft.filters.profile} onChange={(value) => filter('profile', value)} choices={[['', 'Any'], ['complete', 'Complete'], ['incomplete', 'Incomplete']]} />
          <FilterSelect label="CV" value={draft.filters.cv} onChange={(value) => filter('cv', value)} choices={[['', 'Any'], ['available', 'Available'], ['missing', 'Missing']]} />
          <FilterSelect label="Email verification" value={draft.filters.verified} onChange={(value) => filter('verified', value)} choices={[['', 'Any'], ['verified', 'Verified'], ['unverified', 'Unverified']]} />
          <FilterSelect label="Application vacancy" value={draft.filters.vacancyId} onChange={(value) => filter('vacancyId', value)} choices={[['', 'Any vacancy'], ...(audience.data?.vacancies || []).map((job) => [job.id, `${job.title} · ${job.location}`])]} />
          <FilterSelect label="Application stage" value={draft.filters.stage} onChange={(value) => filter('stage', value)} choices={[['', 'Any stage'], ['pending', 'New'], ['reviewed', 'In review'], ['shortlisted', 'Shortlisted'], ['rejected', 'Rejected']]} />
          {(draft.filters.joinedFrom || draft.filters.joinedTo) && <><label className="text-sm font-semibold">Joined from<input className={control} type="date" value={draft.filters.joinedFrom || ''} onChange={(event) => filter('joinedFrom', event.target.value)} /></label><label className="text-sm font-semibold">Joined to<input className={control} type="date" value={draft.filters.joinedTo || ''} onChange={(event) => filter('joinedTo', event.target.value)} /></label></>}
        </div>
        {channel === 'newsletter' && superAdmin && <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5 size-4 accent-blue-700" checked={draft.includeTeam} onChange={(event) => { change({ ...draft, includeTeam: event.target.checked, selection: { mode: 'explicit', ids: [], excludeIds: [] } }); setPage(1) }} /><span className="font-semibold">Include active team members<span className="mt-1 block text-slate-500">For this newsletter only. Pending invites, suspended staff and previous opt-outs are excluded.</span></span></label>}
        {activeFilters.length > 0 && <div aria-label="Active filters" className="flex flex-wrap gap-2">{activeFilters.map(([key, value]) => <span key={key} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{key}: {String(value)}</span>)}<button className="text-sm text-blue-800 underline" onClick={() => { change({ ...draft, filters: {}, selection: { mode: 'explicit', ids: [], excludeIds: [] } }); setPage(1) }}>Clear filters</button></div>}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><p aria-live="polite"><strong>{audience.data?.pagination.total.toLocaleString() || 0}</strong> matching · <strong>{count}</strong> selected / 1,000</p><div className="flex gap-3"><button className={button} disabled={!audience.data?.pagination.total || busy} onClick={() => change({ ...draft, selection: { mode: 'all', ids: [], excludeIds: [] } })}>Select all matching</button><button className={button} onClick={() => change({ ...draft, selection: { mode: 'explicit', ids: [], excludeIds: [] } })}>Clear selection</button></div></div>
        {count > 1000 && <p role="alert" className="text-sm text-red-700">This audience exceeds 1,000 people. Narrow your filters or exclude people before reviewing.</p>}
        {audience.isPending && <p role="status" className="animate-pulse py-8 text-slate-500">Loading recipients…</p>}
        {audience.isError && <p role="alert" className="text-red-700">{audience.error.message} <button className={button} onClick={() => void audience.refetch()}>Retry</button></p>}
        {audience.data && <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3"><input aria-label="Select current page" type="checkbox" className="size-4 accent-blue-700" checked={Boolean(audience.data.data.length) && audience.data.data.every((person) => isSelected(person.id))} onChange={(event) => { const pageIds = audience.data!.data.map((person) => person.id); const selection = draft.selection; const key = selection.mode === 'all' ? 'excludeIds' : 'ids'; const add = selection.mode === 'all' ? !event.target.checked : event.target.checked; const next = new Set(selection[key]); pageIds.forEach((id) => { if (add) next.add(id); else next.delete(id) }); if (next.size > 1000) { toast.error('Select no more than 1,000 people'); return } change({ ...draft, selection: { ...selection, [key]: [...next] } }) }} /></th><th className="p-3">Recipient</th><th className="p-3">Account</th><th className="p-3">Profile / CV</th>{superAdmin && <th className="p-3">Last active</th>}</tr></thead><tbody className="divide-y divide-slate-100">{audience.data.data.map((person) => <tr key={person.id}><td className="p-3"><input type="checkbox" className="size-4 accent-blue-700" aria-label={`Select ${person.name}`} checked={isSelected(person.id)} onChange={(event) => selectPerson(person.id, event.target.checked)} /></td><td className="p-3"><span className="block font-semibold text-slate-950">{person.name}</span><span className="text-slate-500">{person.email}</span></td><td className="p-3 capitalize">{person.audience}{person.audience === 'candidate' && <span className="block text-xs text-slate-500">{person.emailVerified ? 'Verified' : 'Unverified'}</span>}</td><td className="p-3">{person.audience === 'team' ? '—' : <>{person.profileComplete ? 'Complete profile' : 'Incomplete profile'}<span className="block text-slate-500">{person.hasCv ? 'CV available' : 'No CV link'}</span></>}</td>{superAdmin && <td className="p-3 text-slate-500">{person.lastActiveAt ? formatDateInTimeZone(person.lastActiveAt, settings.timeZone, { dateStyle: 'medium', timeStyle: 'short' }) : 'Not recorded'}</td>}</tr>)}{!audience.data.data.length && <tr><td colSpan={superAdmin ? 5 : 4} className="p-8 text-center text-slate-500">No eligible people match these filters.</td></tr>}</tbody></table></div>}
        {audience.data && <Pages paging={audience.data.pagination} setPage={setPage} />}
        <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => setStep(0)}>← Choose email</button><button className={button} disabled={busy} onClick={() => void act(async () => { await save(); toast.success('Draft saved') })}>Save draft</button><button className={`${button} !bg-slate-950 !text-white`} disabled={busy || !count || count > 1000 || audience.isFetching || audience.isError} onClick={() => void reviewEmail()}>{busy ? 'Preparing review…' : 'Review email →'}</button></div>
      </div>}
      {step === 2 && review && <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-950">{review.subject}</h2><p className="mt-1 text-sm text-slate-600">{review.candidateCount} candidates{review.teamCount ? ` · ${review.teamCount} team members` : ''} · {review.recipientCount} total</p></div><div className="flex gap-2"><button aria-pressed={!mobile} className={button} onClick={() => setMobile(false)}>Desktop</button><button aria-pressed={mobile} className={button} onClick={() => setMobile(true)}>Mobile</button></div></div>
        <label className="block text-sm font-semibold">Preview for<select className={control} disabled={busy} onChange={(event) => void act(async () => { if (saved) setReview(await dispatchData<Review>(`/${saved._id}/preview`, 'POST', { recipientId: event.target.value })) })}>{review.recipients.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.audience}</option>)}</select></label>
        <iframe title="Server-rendered email preview" sandbox="" srcDoc={review.html} className={`mx-auto h-[550px] max-w-full rounded-lg border border-slate-200 bg-white ${mobile ? 'w-[375px]' : 'w-full'}`} />
        <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Delivery<select className={control} value={schedule ? 'scheduled' : 'now'} onChange={(event) => { setSchedule(event.target.value === 'now' ? '' : ' '); setRequestId(crypto.randomUUID()) }}><option value="now">Send now</option><option value="scheduled">Schedule delivery</option></select></label>{schedule && <label className="block text-sm font-semibold">Delivery time · {settings.timeZone}<input type="datetime-local" className={control} value={schedule.trim()} onChange={(event) => { setSchedule(event.target.value || ' '); setRequestId(crypto.randomUUID()) }} /><span className="mt-1 block font-normal text-slate-500">Up to 90 days ahead, in the organization time zone.</span></label>}</div>
        <p className="text-sm leading-6 text-slate-500">Larger sends may take time. Recipients are frozen when accepted; delivery rechecks preferences and account eligibility. Sent means accepted by SMTP, not inbox delivery.</p>
        <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => { setStep(1); setReview(null) }}>← Edit recipients</button><button className={button} disabled={busy} onClick={() => void act(async () => { if (saved) { await dispatchData(`/${saved._id}/test`, 'POST', {}); toast.success('Test email queued to your account') } })}>Send test to me</button><button className={`${button} !bg-slate-950 !text-white`} disabled={busy || Boolean(schedule && !schedule.trim())} onClick={() => setConfirm(true)}>{schedule ? 'Schedule email' : 'Queue email'}</button></div>
      </div>}
    </fieldset>
    <section aria-label="Email history" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold text-slate-950">Drafts and recent dispatches</h2><p className="mt-1 text-sm text-slate-500">Dispatch summaries last one year. Individual delivery details last 30 days.</p>
      {history.isPending && <p role="status" className="py-6">Loading email history…</p>}
      {history.isError && <p role="alert">Unable to load history. <button className={button} onClick={() => void history.refetch()}>Retry</button></p>}
      <div className="mt-5 divide-y divide-slate-200">{history.data?.data.map((item) => <div key={item._id} className="flex flex-wrap items-start justify-between gap-4 py-4"><div><p className="font-semibold text-slate-900">{templates.find((template) => template.key === item.template)?.title || item.template} <span className="ml-2 rounded bg-slate-100 px-2 py-1 text-xs font-medium capitalize">{item.state === 'queued' && item.live?.processing ? 'Processing' : item.state === 'queued' && item.live?.retry ? 'Retrying' : item.state}</span></p><p className="mt-1 text-sm text-slate-500">{item.ownerName || 'Team member'} · {item.recipientCount} recipients · {formatDateInTimeZone(item.scheduledFor || item.queuedAt || item.createdAt, settings.timeZone, { dateStyle: 'medium', timeStyle: 'short' })}</p>{item.state !== 'draft' && <p className="mt-1 text-sm text-slate-600">{item.outcomes.sent} sent · {item.outcomes.dead} failed · {item.outcomes.skipped} skipped · {item.outcomes.cancelled} cancelled</p>}</div><div className="flex flex-wrap gap-2">{item.state === 'draft' && <button className={button} disabled={busy} onClick={() => void act(async () => { const stored = await dispatchData<Dispatch>(`/${item._id}`); setSaved(stored); setDraft({ channel: stored.channel, template: stored.template, content: stored.content, filters: stored.filters, selection: stored.selection, includeTeam: stored.includeTeam }); setReview(null); setStep(0) })}>Resume draft</button>}{item.state !== 'draft' && <button className={button} onClick={() => { setDetail(item._id); setDetailPage(1) }}>Delivery details</button>}{['draft', 'queued', 'scheduled'].includes(item.state) && <button className={button} disabled={busy} onClick={() => void act(async () => { await dispatchData(`/${item._id}/cancel`, 'POST', {}); toast.success('Unfinished deliveries cancelled. Emails already transmitting cannot be recalled.'); await client.invalidateQueries({ queryKey: ['broadcast-history'] }) })}>Cancel</button>}</div></div>)}{history.data && !history.data.data.length && <p className="py-8 text-center text-slate-500">No saved drafts or dispatches yet.</p>}</div>
      {history.data && <Pages paging={history.data.pagination} setPage={setHistoryPage} />}
    </section>
    {detail && <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Individual delivery details</h2><button className={button} onClick={() => setDetail(null)}>Close details</button></div>{deliveries.isPending && <p role="status" className="py-5">Loading deliveries…</p>}{deliveries.isError && <p role="alert">Unable to load delivery details. <button onClick={() => void deliveries.refetch()} className={button}>Retry</button></p>}<ul className="mt-4 divide-y divide-slate-200">{deliveries.data?.data.map((item) => <li key={item._id} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><span>{item.recipientLabel} <span className="text-slate-500">{item.recipient}</span></span><span className={`capitalize ${item.status === 'dead' ? 'text-red-700' : 'text-slate-600'}`}>{item.status === 'dead' ? 'Failed' : item.status === 'pending' ? 'Queued' : item.status}{item.lastFailure && ` · ${item.lastFailure.code}`}</span></li>)}</ul>{deliveries.data && !deliveries.data.data.length && <p className="py-5 text-slate-500">No individual records available. Delivery details expire after 30 days.</p>}{deliveries.data && <Pages paging={deliveries.data.pagination} setPage={setDetailPage} />}</section>}
    <Modal isOpen={confirm} onClose={() => setConfirm(false)} onSubmit={() => void send()} disabled={busy} title="Confirm email dispatch" actionLabel={schedule ? 'Confirm schedule' : 'Confirm and queue'} body={<div className="space-y-3 text-sm text-slate-600"><p><strong>{templates.find((item) => item.key === draft.template)?.title}</strong> to <strong>{review?.recipientCount} recipients</strong>.</p><p>{review?.candidateCount} candidates · {review?.teamCount} team members</p><p>Delivery: <strong>{schedule ? `${schedule.replace('T', ' ')} (${settings.timeZone})` : 'As soon as sending capacity is available'}</strong>.</p><p>Emails accepted by SMTP or currently transmitting cannot be recalled.</p>{error && <p role="alert" className="text-red-700">{error}</p>}</div>} />
  </div>
}

function FilterSelect({ label, value, choices, onChange }: { label: string; value?: string; choices: string[][]; onChange: (value: string) => void }) {
  return <label className="text-sm font-semibold">{label}<select className={control} value={value || ''} onChange={(event) => onChange(event.target.value)}>{choices.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
}
function Pages({ paging, setPage }: { paging: Paging; setPage: (page: number) => void }) {
  return <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-4 text-sm"><button className={button} disabled={!paging.hasPreviousPage} onClick={() => setPage(paging.page - 1)}>Previous</button><span>Page {paging.page} of {paging.totalPages}</span><button className={button} disabled={!paging.hasNextPage} onClick={() => setPage(paging.page + 1)}>Next</button></nav>
}
