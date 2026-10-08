'use client'
import { useState } from 'react'
import ApplicationAnalyticsSummary from './ApplicationAnalyticsSummary'
import EmailAnalytics from '@/components/team-emails/EmailAnalytics'
export default function AnalyticsPageClient() {
  const [tab, setTab] = useState('Applications')
  return <><div role="tablist" aria-label="Analytics reports" className="mb-7 flex gap-6 border-b border-slate-200">{['Applications', 'Emails'].map((label) => <button key={label} role="tab" id={`analytics-${label}`} aria-controls="analytics-panel" aria-selected={tab === label} tabIndex={tab === label ? 0 : -1} onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { const other = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>('[aria-selected="false"]'); other?.click(); other?.focus(); event.preventDefault() } }} onClick={() => setTab(label)} className={`border-b-2 pb-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-700 ${tab === label ? 'border-blue-700 text-slate-950' : 'border-transparent text-slate-500'}`}>{label}</button>)}</div><div id="analytics-panel" role="tabpanel" aria-labelledby={`analytics-${tab}`}>{tab === 'Applications' ? <ApplicationAnalyticsSummary /> : <EmailAnalytics />}</div></>
}
