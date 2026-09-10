'use client'

import RecruiterCandidateEmailCenter from '@/components/team-emails/RecruiterCandidateEmailCenter'
import TeamEmailCenter from '@/components/team-emails/TeamEmailCenter'
import { useUser } from '@/hooks/useUsers'

export default function EmailCenterPageClient() {
  const { data: user } = useUser()
  const recruiter = user?.role === 'recruiter'

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-8">
        <p className="text-sm font-semibold text-blue-700">{recruiter ? 'Candidate communication' : 'Team communication'}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Emails</h1>
        <p className="mt-2 max-w-2xl text-base text-slate-600">
          {recruiter
            ? 'Contact applicants to vacancies you uploaded and monitor delivery without leaving the dashboard.'
            : 'Send relevant operational reminders and direct messages to your team without leaving the dashboard.'}
        </p>
      </header>
      {recruiter ? <RecruiterCandidateEmailCenter /> : <TeamEmailCenter />}
    </div>
  )
}
