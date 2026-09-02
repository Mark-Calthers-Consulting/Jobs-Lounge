'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  LuChevronDown,
  LuExternalLink,
  LuLifeBuoy,
  LuMail,
  LuPhone,
  LuSearch,
} from 'react-icons/lu'

import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { useUser } from '@/hooks/useUsers'
import { hasStaffPermission, type StaffPermission } from '@/utils/staffPermissions'

type SupportArea = 'candidate' | 'staff'

type HelpTopic = {
  category: string
  title: string
  summary: string
  steps?: readonly string[]
  href?: string
  action?: string
  permission?: StaffPermission
  keywords: string
}

const candidateTopics: readonly HelpTopic[] = [
  {
    category: 'Profile and documents',
    title: 'Upload and share your CV',
    summary: 'Upload your CV to Google Drive, allow “Anyone with the link” to view it, then paste the copied share link into your profile.',
    steps: [
      'Open Profile and go to Documents.',
      'Follow the phone or computer instructions above the CV field.',
      'Test the link in an incognito window before saving.',
    ],
    href: '/dashboard/profile',
    action: 'Open profile',
    keywords: 'resume document google drive access private link upload cv',
  },
  {
    category: 'Profile and documents',
    title: 'Complete or update your profile',
    summary: 'Your profile is saved section by section, so you can update contact, professional, document, and optional personal information independently.',
    href: '/dashboard/profile',
    action: 'Edit profile',
    keywords: 'name phone education nysc experience completion personal details',
  },
  {
    category: 'Applications',
    title: 'An application will not submit',
    summary: 'Confirm the vacancy is open, your CV link begins with http:// or https://, and the document opens without requesting access.',
    steps: [
      'Open your CV link in a private or incognito window.',
      'Correct the link in Profile if access is blocked.',
      'Return to the vacancy and submit again.',
    ],
    href: '/vacancies',
    action: 'Browse vacancies',
    keywords: 'apply error failed submit cv invalid already applied closed vacancy',
  },
  {
    category: 'Applications',
    title: 'View applications and saved jobs',
    summary: 'Your Applications area keeps submitted applications and saved vacancies separate. Recruiter workflow stages remain private.',
    href: '/dashboard/applications',
    action: 'Open applications',
    keywords: 'submitted application status saved job bookmark history',
  },
  {
    category: 'Account and access',
    title: 'Verify your email address',
    summary: 'Open Settings to send another verification email. Use only the newest verification message if you requested it more than once.',
    href: '/dashboard/settings',
    action: 'Open settings',
    keywords: 'verification email resend link expired inbox spam',
  },
  {
    category: 'Account and access',
    title: 'Change or reset your password',
    summary: 'Use Change password when you can sign in. Use Forgot password from the login page when you cannot access your account.',
    href: '/dashboard/settings/change-password',
    action: 'Change password',
    keywords: 'forgot password reset login sign in security',
  },
]

const staffTopics: readonly HelpTopic[] = [
  {
    category: 'Vacancies',
    title: 'Create and publish a vacancy',
    summary: 'Create the listing, complete every required section, and save it as Draft until it has been reviewed. Change it to Open when candidates can apply.',
    href: '/admin-center/jobs/create',
    action: 'Create vacancy',
    permission: 'jobs:manage',
    keywords: 'job upload create draft publish open listing',
  },
  {
    category: 'Vacancies',
    title: 'A vacancy is not visible publicly',
    summary: 'Only Open, non-archived vacancies appear publicly. Restore archived vacancies first; restored vacancies return as Closed and must be published again.',
    href: '/admin-center/jobs',
    action: 'Review vacancies',
    permission: 'jobs:manage',
    keywords: 'missing public closed archived restore publish open status',
  },
  {
    category: 'Recruitment',
    title: 'Review applications for one vacancy',
    summary: 'Open Vacancy inbox, select the vacancy, then use the queue or board to filter, prioritise, note, and move applications through private stages.',
    href: '/admin-center/applications/by-vacancy',
    action: 'Open Vacancy inbox',
    permission: 'applications:review',
    keywords: 'applicant candidate queue kanban board stage shortlisted rejected notes priority',
  },
  {
    category: 'Recruitment',
    title: 'Find candidates or registered users',
    summary: 'Candidates have submitted at least one application. People without applications remain under Registered users on the same directory page.',
    href: '/admin-center/candidates',
    action: 'Open directory',
    permission: 'candidates:view',
    keywords: 'candidate registered user applicant directory no applications search',
  },
  {
    category: 'Recruitment',
    title: 'Export recruitment information',
    summary: 'Vacancy summaries download immediately. Comprehensive candidate records are governed: Recruiters request approval, while Super-admins can approve and download.',
    href: '/admin-center/applications/exports',
    action: 'View export requests',
    permission: 'applications:review',
    keywords: 'csv download report comprehensive approval vacancy summary export',
  },
  {
    category: 'Content and team',
    title: 'Create or publish a Career Insights article',
    summary: 'Use the Blog workspace to write, preview, publish, return to Draft, or permanently delete an article.',
    href: '/admin-center/blog',
    action: 'Open Blog',
    permission: 'blogs:manage',
    keywords: 'blog article markdown image career insights draft publish delete',
  },
  {
    category: 'Content and team',
    title: 'Manage staff accounts and invitations',
    summary: 'Super-admins can create Administrators or Recruiters, resend or cancel invitations, change roles, and remove eligible staff accounts.',
    href: '/admin-center/team',
    action: 'Open Team',
    permission: 'team:manage',
    keywords: 'administrator recruiter invite resend cancel role staff team delete',
  },
  {
    category: 'Account and access',
    title: 'Update your staff profile or password',
    summary: 'Your profile contains your staff contact details. Settings provides account information, email verification, and secure password changes.',
    href: '/admin-center/profile',
    action: 'Open profile',
    permission: 'admin:access',
    keywords: 'name telephone email verification password reset profile settings login',
  },
]

const SupportCenter = ({ area }: { area: SupportArea }) => {
  const [search, setSearch] = useState('')
  const { supportEmail } = usePlatformSettings()
  const { data: user } = useUser()

  const availableTopics = useMemo(() => {
    const source = area === 'candidate' ? candidateTopics : staffTopics
    return source.filter((topic) => !topic.permission || hasStaffPermission(user?.role, topic.permission))
  }, [area, user?.role])

  const filteredTopics = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return availableTopics
    return availableTopics.filter((topic) => (
      `${topic.title} ${topic.summary} ${topic.category} ${topic.keywords}`
        .toLocaleLowerCase()
        .includes(term)
    ))
  }, [availableTopics, search])

  const groupedTopics = useMemo(() => {
    const groups = new Map<string, HelpTopic[]>()
    for (const topic of filteredTopics) {
      groups.set(topic.category, [...(groups.get(topic.category) || []), topic])
    }
    return Array.from(groups.entries())
  }, [filteredTopics])

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <header>
        <p className="text-sm font-semibold text-[#184aa2]">Help and support</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Support Center</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
          {area === 'candidate'
            ? 'Find help with your account, profile, CV, and applications.'
            : 'Find practical guidance for your account and the recruitment tools available to your role.'}
        </p>
      </header>

      <div className="mt-7 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <label htmlFor="support-search" className="text-sm font-semibold text-slate-900">What do you need help with?</label>
        <div className="relative mt-2">
          <LuSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            id="support-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search help topics…"
            className="min-h-11 w-full rounded-md border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-slate-950 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <p role="status" aria-live="polite" className="mt-2 text-xs text-slate-500">
          {filteredTopics.length} {filteredTopics.length === 1 ? 'topic' : 'topics'} available
        </p>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <section aria-labelledby="support-topics-title" className="min-w-0">
          <h2 id="support-topics-title" className="text-xl font-semibold text-slate-950">Help topics</h2>

          {groupedTopics.length > 0 ? (
            <div className="mt-4 space-y-7">
              {groupedTopics.map(([category, topics]) => (
                <section key={category} aria-labelledby={`support-${category.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}>
                  <h3 id={`support-${category.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`} className="mb-2 text-sm font-semibold text-slate-600">
                    {category}
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {topics.map((topic) => (
                      <details key={topic.title} className="group border-b border-slate-200 last:border-b-0">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#184aa2] sm:px-5">
                          <span>{topic.title}</span>
                          <LuChevronDown aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" size={18} />
                        </summary>
                        <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">
                          <p className="text-sm leading-6 text-slate-600">{topic.summary}</p>
                          {topic.steps ? (
                            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-slate-700 marker:font-semibold marker:text-slate-500">
                              {topic.steps.map((step) => <li key={step}>{step}</li>)}
                            </ol>
                          ) : null}
                          {topic.href && topic.action ? (
                            <Link href={topic.href} className="mt-4 inline-flex font-semibold text-[#184aa2] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2">
                              {topic.action} →
                            </Link>
                          ) : null}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white px-5 py-8 text-center">
              <p className="font-semibold text-slate-900">No help topics match “{search.trim()}”.</p>
              <p className="mt-1 text-sm text-slate-600">Try a shorter search or contact the support team.</p>
              <button type="button" onClick={() => setSearch('')} className="mt-4 text-sm font-semibold text-[#184aa2] underline-offset-4 hover:underline">
                Clear search
              </button>
            </div>
          )}
        </section>

        <aside aria-labelledby="contact-support-title" className="rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-8">
          <LuLifeBuoy aria-hidden="true" className="text-[#184aa2]" size={24} />
          <h2 id="contact-support-title" className="mt-3 text-lg font-semibold text-slate-950">Still need help?</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tell us what happened, the page you were using, and any reference number shown. Never send your password.
          </p>

          <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
            <a href={`mailto:${supportEmail}`} className="flex items-start gap-3 text-sm text-slate-700 hover:text-[#184aa2] hover:underline">
              <LuMail aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" size={18} />
              <span className="break-all">{supportEmail}</span>
            </a>
            <a href="tel:+2349028888885" className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#184aa2] hover:underline">
              <LuPhone aria-hidden="true" className="shrink-0 text-slate-400" size={18} />
              +234 902 888 8885
            </a>
          </div>

          <Link href="/contact" className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#003B6D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#002B50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2">
            Contact support <LuExternalLink aria-hidden="true" size={16} />
          </Link>
        </aside>
      </div>
    </div>
  )
}

export default SupportCenter
