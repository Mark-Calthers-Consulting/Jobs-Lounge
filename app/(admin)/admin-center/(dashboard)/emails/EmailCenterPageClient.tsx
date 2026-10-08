'use client'

import RecruiterCandidateEmailCenter from '@/components/team-emails/RecruiterCandidateEmailCenter'
import TeamEmailCenter from '@/components/team-emails/TeamEmailCenter'
import { useUser } from '@/hooks/useUsers'
import { useState } from 'react'
import BroadcastEmailCenter from '@/components/team-emails/BroadcastEmailCenter'

export default function EmailCenterPageClient() {
  const { data: user } = useUser()
  const recruiter = user?.role === 'recruiter'
  const [tab, setTab] = useState<string>('')
  const [applicationMessages, setApplicationMessages] = useState(false)
  const currentTab = tab || (recruiter ? 'Candidates' : 'Team')

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-8">
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Emails</h1>
        <p className="mt-2 max-w-2xl text-base text-slate-600">
          {recruiter
            ? 'Send messages and newsletters to applicants to your vacancies, and follow their delivery.'
            : 'Write to your team, contact candidates and share career newsletters from one place.'}
        </p>
      </header>
      <div role="tablist" aria-label="Email audiences" className="mb-7 flex gap-6 border-b border-slate-200">
        {(recruiter ? ['Candidates', 'Newsletter'] : ['Team', 'Candidates', 'Newsletter']).map((label) => <button key={label} id={`email-tab-${label}`} role="tab" aria-selected={currentTab === label} aria-controls="email-tab-panel" tabIndex={currentTab === label ? 0 : -1} onClick={() => { setTab(label); setApplicationMessages(false) }} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { const buttons = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role="tab"]')); const next = buttons[(buttons.indexOf(event.currentTarget) + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length]; next.click(); next.focus(); event.preventDefault() } }} className={`border-b-2 pb-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-700 ${currentTab === label ? 'border-blue-700 text-slate-950' : 'border-transparent text-slate-500'}`}>{label}</button>)}
      </div>
      <div role="tabpanel" id="email-tab-panel" aria-labelledby={`email-tab-${currentTab.replaceAll(' ', '-')}`}>
        {currentTab === 'Candidates' && <p className="mb-5 text-sm text-slate-600">{applicationMessages ? 'Writing about a specific application.' : 'Need to write about a specific application?'} <button type="button" className="font-semibold text-blue-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-700" onClick={() => setApplicationMessages(!applicationMessages)}>{applicationMessages ? 'Back to candidate emails' : 'Open application messages'}</button></p>}
        {currentTab === 'Team' ? <TeamEmailCenter /> : currentTab === 'Candidates' && applicationMessages ? <RecruiterCandidateEmailCenter /> : <BroadcastEmailCenter key={currentTab} channel={currentTab === 'Newsletter' ? 'newsletter' : 'candidate'} superAdmin={!recruiter} />}
      </div>
    </div>
  )
}
