'use client'

import RecruiterCandidateEmailCenter from '@/components/team-emails/RecruiterCandidateEmailCenter'
import TeamEmailCenter from '@/components/team-emails/TeamEmailCenter'
import { useUser } from '@/hooks/useUsers'
import { useState } from 'react'
import BroadcastEmailCenter from '@/components/team-emails/BroadcastEmailCenter'
import { useStaffFeatureSettings } from '@/hooks/useSettings'
import { useQuery } from '@tanstack/react-query'
import { dispatchData, type ContentOptions } from '@/api/emailDispatches'
import EmailApprovalQueue, { EmailRequestStatus } from '@/components/team-emails/EmailApprovalQueue'

function DelegatedComposer({ ownerId }: { ownerId: string }) {
  const features = useStaffFeatureSettings(true, ownerId)
  const options = useQuery({ queryKey: ['broadcast-content-options', 'delegated', ownerId, features.data?.candidateEmail?.revision], queryFn: () => dispatchData<ContentOptions>('/options'), enabled: features.data?.candidateEmail?.enabled === true })
  if (features.isPending || (features.data?.candidateEmail?.enabled && options.isPending)) return <div role="status" aria-label="Loading email permissions" className="h-64 animate-pulse rounded-xl bg-slate-100" />
  if (features.isError || options.isError) return <p role="alert">Email permissions could not be loaded. <button className="font-semibold underline" onClick={() => { void features.refetch(); void options.refetch() }}>Try again</button></p>
  if (!features.data?.candidateEmail?.enabled || !options.data?.templates?.length) return <p role="alert">Candidate email requests are not enabled for your account.</p>
  return <BroadcastEmailCenter key={`${ownerId}:${features.data.candidateEmail.revision}`} ownerId={ownerId} accessRevision={features.data.candidateEmail.revision} channel="candidate" superAdmin={false} delegatedTemplates={options.data.templates.filter((template) => features.data.candidateEmail!.templates.includes(template.key))} audienceScope={features.data.candidateEmail.audienceScope} />
}
export default function EmailCenterPageClient({ initialRequestId }: { initialRequestId?: string }) {
  const { data: user } = useUser()
  const superAdmin = user?.role === 'super-admin'
  const [tab, setTab] = useState<string>('')
  const [applicationMessages, setApplicationMessages] = useState(false)
  const currentTab = tab || (initialRequestId ? 'Requests' : 'Team')
  if (!user) return <p role="status">Loading email workspace…</p>
  if (!superAdmin) return <div className="mx-auto max-w-[1500px]"><header className="mb-8"><h1 className="text-3xl font-bold text-slate-950">Candidate emails</h1><p className="mt-2 text-base text-slate-600">Choose an assigned template and request approval for each batch. Your Super-admin reviews the recipients before anything is sent.</p></header>{initialRequestId && <EmailRequestStatus ownerId={user._id} requestId={initialRequestId} />}<DelegatedComposer ownerId={user._id} /></div>

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-8">
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Emails</h1>
        <p className="mt-2 max-w-2xl text-base text-slate-600">
          Write to your team, contact candidates and review staff email requests from one place.
        </p>
      </header>
      <div role="tablist" aria-label="Email audiences" className="mb-7 flex gap-6 border-b border-slate-200">
        {['Team', 'Candidates', 'Newsletter', 'Requests'].map((label) => <button key={label} id={`email-tab-${label}`} role="tab" aria-selected={currentTab === label} aria-controls="email-tab-panel" tabIndex={currentTab === label ? 0 : -1} onClick={() => { setTab(label); setApplicationMessages(false) }} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { const buttons = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role="tab"]')); const next = buttons[(buttons.indexOf(event.currentTarget) + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length]; next.click(); next.focus(); event.preventDefault() } }} className={`border-b-2 pb-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-700 ${currentTab === label ? 'border-blue-700 text-slate-950' : 'border-transparent text-slate-500'}`}>{label}</button>)}
      </div>
      <div role="tabpanel" id="email-tab-panel" aria-labelledby={`email-tab-${currentTab.replaceAll(' ', '-')}`}>
        {currentTab === 'Candidates' && <p className="mb-5 text-sm text-slate-600">{applicationMessages ? 'Writing about a specific application.' : 'Need to write about a specific application?'} <button type="button" className="font-semibold text-blue-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-700" onClick={() => setApplicationMessages(!applicationMessages)}>{applicationMessages ? 'Back to candidate emails' : 'Open application messages'}</button></p>}
        {currentTab === 'Requests' ? <EmailApprovalQueue ownerId={user._id} initialRequestId={initialRequestId} /> : currentTab === 'Team' ? <TeamEmailCenter /> : currentTab === 'Candidates' && applicationMessages ? <RecruiterCandidateEmailCenter /> : <BroadcastEmailCenter key={`${user._id}:${currentTab}`} ownerId={user._id} channel={currentTab === 'Newsletter' ? 'newsletter' : 'candidate'} superAdmin />}
      </div>
    </div>
  )
}
