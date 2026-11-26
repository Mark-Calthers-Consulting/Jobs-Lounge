'use client'

import { useDeferredValue, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiPath } from '@/api/base'
import { csrfFetch } from '@/api/csrf'
import { readApiResponse } from '@/api/errors'
import type { CandidateEmailAccess, DelegatedTemplate, Paging } from '@/api/emailDispatches'

type Staff = { id: string; name: string; email: string; role: string; active: boolean; access: CandidateEmailAccess }
const choices: [DelegatedTemplate, string][] = [['candidate-cv', 'Add your CV'], ['candidate-cv-attention', 'CV needs attention'], ['candidate-profile', 'Complete your profile']]
const control = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
async function accessRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await (body ? csrfFetch : fetch)(apiPath(`/admin/settings/candidate-email-access${path}`), { method: body ? 'PATCH' : 'GET', credentials: 'include', cache: 'no-store', ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) })
  return readApiResponse<T>(response, 'Unable to load candidate email access')
}
function StaffAccessRow({ staff, onSaved }: { staff: Staff; onSaved: () => Promise<unknown> }) {
  const [access, setAccess] = useState(staff.access)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const save = async () => {
    setBusy(true); setError(''); setMessage('')
    try {
      const result = await accessRequest<{ data: CandidateEmailAccess }>(`/${staff.id}`, { enabled: access.enabled, templates: access.templates, audienceScope: access.audienceScope, revision: access.revision })
      setAccess(result.data); setMessage('Access saved.'); await onSaved()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save access. Refresh before trying again.') } finally { setBusy(false) }
  }
  return <fieldset disabled={busy} className="min-w-0 rounded-lg border border-slate-200 p-4">
    <legend className="px-2 text-base font-semibold text-slate-950">{staff.name}</legend>
    <p className="break-all text-sm text-slate-600">{staff.email} · {staff.role}{!staff.active ? ' · Account inactive' : ''}</p>
    <label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" disabled={!staff.active} checked={access.enabled} onChange={(event) => setAccess({ ...access, enabled: event.target.checked })} className="size-4 accent-blue-700" />Enable candidate email requests</label>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold text-slate-800">Allowed templates</legend>{choices.map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm"><input type="checkbox" disabled={!staff.active} checked={access.templates.includes(key)} onChange={(event) => setAccess({ ...access, templates: event.target.checked ? [...access.templates, key] : access.templates.filter((value) => value !== key) })} className="size-4 accent-blue-700" />{label}</label>)}</fieldset>
      <label className="text-sm font-semibold text-slate-800">Recipient scope<select className={`${control} mt-3 w-full`} disabled={!staff.active} value={access.audienceScope} onChange={(event) => setAccess({ ...access, audienceScope: event.target.value as CandidateEmailAccess['audienceScope'] })}><option value="all-applicants">Any applicant</option><option value="own-applicants">Own vacancy applicants</option></select><span className="mt-2 block font-normal text-slate-600">Accounts without applications are always excluded. This does not grant access to candidate profiles or CVs.</span></label>
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm text-emerald-800">{message}</p>}
    <button type="button" className={`${control} mt-4 font-semibold disabled:opacity-50`} disabled={busy || (access.enabled && !access.templates.length)} onClick={() => void save()}>{busy ? 'Saving…' : `Save access for ${staff.name}`}</button>
  </fieldset>
}
export default function CandidateEmailAccessSettings() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')
  const deferredSearch = useDeferredValue(search)
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['candidate-email-access', deferredSearch, page], queryFn: () => accessRequest<{ data: Staff[]; pagination: Paging }>(`?${new URLSearchParams({ search: deferredSearch, page: String(page) })}`) })
  return <section aria-labelledby="candidate-email-access-heading" className="rounded-xl border border-slate-200 bg-white p-6">
    <h2 id="candidate-email-access-heading" className="text-lg font-semibold text-slate-950">Candidate email access</h2>
    <p className="mt-2 text-sm text-slate-600">Choose individual Admins and Recruiters. Every batch uses locked wording and requires Super-admin approval.</p>
    <p className="mt-2 text-sm text-slate-600">Removing access or a template stops affected unsent batches. Restricting scope cancels outstanding batches so they can be requested again. Already transmitting emails cannot be recalled.</p>
    <label className="mt-4 block text-sm font-semibold">Find staff<input className={`${control} mt-2 w-full`} value={search} maxLength={100} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search name or email" /></label>
    {query.isPending && <div role="status" aria-label="Loading staff email access" className="mt-4 h-48 animate-pulse rounded-lg bg-slate-100" />}
    {query.isError && <p role="alert" className="mt-4 text-sm text-red-700">Staff access could not be loaded. <button className="underline" onClick={() => void query.refetch()}>Try again</button></p>}
    {notice && <p role="status" className="mt-4 text-sm text-emerald-800">{notice}</p>}
    <div className="mt-6 space-y-4">{query.data?.data.map((staff) => <StaffAccessRow key={`${staff.id}:${staff.access.revision}`} staff={staff} onSaved={async () => { setNotice(`Candidate email access saved for ${staff.name}.`); await client.invalidateQueries({ queryKey: ['candidate-email-access'] }); await client.invalidateQueries({ queryKey: ['platformSettings', 'staffFeatures'] }) }} />)}</div>
    {query.data && !query.data.data.length && <p className="mt-4 text-sm text-slate-600">No Admins or Recruiters match this search.</p>}
    {query.data && <nav aria-label="Staff access pagination" className="mt-4 flex items-center justify-between gap-4 text-sm"><button className={control} disabled={!query.data.pagination.hasPreviousPage} onClick={() => setPage(page - 1)}>Previous staff</button><span>Page {page} of {query.data.pagination.totalPages}</span><button className={control} disabled={!query.data.pagination.hasNextPage} onClick={() => setPage(page + 1)}>Next staff</button></nav>}
  </section>
}
