'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    FiArrowRight,
    FiBriefcase,
    FiCheckCircle,
    FiClock,
    FiLock,
    FiMail,
    FiSave,
    FiSend,
    FiShield,
    FiUser,
} from 'react-icons/fi'
import { toast } from 'sonner'

import { useEmailVerificationRequest, usePasswordResetRequest } from '@/hooks/useAuth'
import {
    useOrganizationSettings,
    useUpdateOrganizationSettings,
} from '@/hooks/useSettings'
import { useUser } from '@/hooks/useUsers'
import type { OrganizationSettings } from '@/types/types'

const roleLabel = (role?: string) => {
    if (role === 'super-admin') return 'Super administrator'
    if (role === 'recruiter') return 'Recruiter'
    return 'Administrator'
}

const permissionsFor = (role?: string) => {
    if (role === 'super-admin') {
        return ['Manage vacancies', 'Review applications', 'View candidates', 'Archive vacancies', 'Manage the staff team', 'Manage organization settings']
    }
    if (role === 'recruiter') {
        return ['Manage vacancies', 'Review applications', 'View candidates', 'Archive and restore vacancies', 'Create blog posts']
    }
    return ['Create vacancies', 'Edit vacancies', 'Publish and close vacancies']
}

const PersonalSettings = () => {
    const userQuery = useUser()
    const verification = useEmailVerificationRequest()
    const reset = usePasswordResetRequest()
    const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

    if (userQuery.isLoading) return <p role="status">Loading account settings…</p>
    if (userQuery.isError || !userQuery.data) {
        return <p role="alert" className="text-red-700">Unable to load your account settings.</p>
    }
    const user = userQuery.data

    const sendVerification = async () => {
        setMessage(null)
        try {
            setMessage({ tone: 'success', text: await verification.mutateAsync() })
        } catch (error) {
            setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Unable to send verification email.' })
        }
    }
    const sendPasswordReset = async () => {
        setMessage(null)
        try {
            setMessage({ tone: 'success', text: await reset.mutateAsync({ email: user.email }) })
        } catch (error) {
            setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Unable to send password reset instructions.' })
        }
    }

    return (
        <div className="space-y-6">
            {message ? (
                <p role={message.tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${message.tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                    {message.text}
                </p>
            ) : null}

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white" aria-labelledby="staff-account-heading">
                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                    <div className="flex items-start gap-3">
                        <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-blue-50 text-[#184aa2]"><FiUser /></span>
                        <div>
                            <h2 id="staff-account-heading" className="text-lg font-semibold text-gray-950">Staff account</h2>
                            <p className="mt-1 text-sm text-gray-600">Your identity, role, and account verification.</p>
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <p className="font-semibold text-gray-950">{user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Staff member'}</p>
                            <p className="mt-1 break-all text-sm text-gray-600">{user.email}</p>
                            <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${user.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {user.emailVerified ? <FiCheckCircle aria-hidden="true" /> : null}
                                {user.emailVerified ? 'Email verified' : 'Email verification required'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {!user.emailVerified ? (
                                <button type="button" onClick={() => void sendVerification()} disabled={verification.isPending} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-gray-300 px-3.5 text-sm font-semibold text-[#003B6D] disabled:opacity-60">
                                    <FiSend aria-hidden="true" />{verification.isPending ? 'Sending…' : 'Send verification'}
                                </button>
                            ) : null}
                            <Link href="/admin-center/profile" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-gray-300 px-3.5 text-sm font-semibold text-[#003B6D]">
                                Edit profile <FiArrowRight aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                    <div className="px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-2">
                            <FiShield aria-hidden="true" className="text-[#184aa2]" />
                            <p className="font-semibold text-gray-950">{roleLabel(user.role)}</p>
                        </div>
                        <ul className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                            {permissionsFor(user.role).map((permission) => (
                                <li key={permission} className="flex items-start gap-2">
                                    <FiCheckCircle aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-600" />
                                    {permission}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white px-5 py-5 sm:px-6" aria-labelledby="staff-password-heading">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#184aa2]"><FiLock /></span>
                        <div>
                            <h2 id="staff-password-heading" className="text-lg font-semibold text-gray-950">Password</h2>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">Send a secure reset link to your staff email. Completing the reset signs out every existing session.</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => void sendPasswordReset()} disabled={reset.isPending} className="min-h-10 shrink-0 rounded-md bg-[#003B6D] px-4 text-sm font-semibold text-white disabled:opacity-60">
                        {reset.isPending ? 'Sending…' : 'Send reset email'}
                    </button>
                </div>
            </section>
        </div>
    )
}

const TIME_ZONE_SUGGESTIONS = [
    'Africa/Lagos',
    'Africa/Accra',
    'Africa/Johannesburg',
    'Europe/London',
    'America/New_York',
    'UTC',
]

const OrganizationSettingsPanel = () => {
    const query = useOrganizationSettings()
    const update = useUpdateOrganizationSettings()
    const [supportEmail, setSupportEmail] = useState('')
    const [timeZone, setTimeZone] = useState('')
    const [defaultJobStatus, setDefaultJobStatus] = useState<'Draft' | 'Open'>('Draft')
    const [defaultDeadlineMode, setDefaultDeadlineMode] = useState<'none' | 'required'>('none')
    const [sectionError, setSectionError] = useState<Record<'regional' | 'vacancy', string | null>>({ regional: null, vacancy: null })

    useEffect(() => {
        if (!query.data) return
        setSupportEmail(query.data.supportEmail)
        setTimeZone(query.data.timeZone)
        setDefaultJobStatus(query.data.defaultJobStatus)
        setDefaultDeadlineMode(query.data.defaultDeadlineMode)
    }, [query.data])

    if (query.isLoading) return <p role="status">Loading organization settings…</p>
    if (query.isError || !query.data) {
        return (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                Unable to load organization settings.
                <button type="button" onClick={() => void query.refetch()} className="ml-2 font-semibold underline">Try again</button>
            </div>
        )
    }

    const save = async (
        section: 'regional' | 'vacancy',
        payload: Partial<OrganizationSettings>,
    ) => {
        setSectionError((current) => ({ ...current, [section]: null }))
        try {
            await update.mutateAsync({ ...payload, revision: query.data.revision })
            toast.success(section === 'regional' ? 'Support and regional settings saved' : 'Vacancy defaults saved')
        } catch (error) {
            setSectionError((current) => ({
                ...current,
                [section]: error instanceof Error ? error.message : 'Unable to save organization settings.',
            }))
        }
    }

    const lastUpdated = query.data.updatedAt
        ? new Intl.DateTimeFormat('en-NG', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: query.data.timeZone,
        }).format(new Date(query.data.updatedAt))
        : null

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="regional-settings-heading">
                <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-blue-50 text-[#184aa2]"><FiMail /></span>
                    <div>
                        <h2 id="regional-settings-heading" className="text-lg font-semibold text-gray-950">Support and region</h2>
                        <p className="mt-1 text-sm text-gray-600">Used for customer-facing help links, email assistance, and timestamp display.</p>
                    </div>
                </div>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    void save('regional', { supportEmail: supportEmail.trim(), timeZone: timeZone.trim() })
                }} className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="organization-support-email" className="text-sm font-medium text-gray-800">Support email</label>
                        <input id="organization-support-email" required type="email" value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-[#184aa2] focus:outline-none" />
                        <p className="mt-1 text-xs leading-5 text-gray-500">This does not change the no-reply sender or contact-form delivery mailbox.</p>
                    </div>
                    <div>
                        <label htmlFor="organization-time-zone" className="text-sm font-medium text-gray-800">Time zone</label>
                        <input id="organization-time-zone" required list="organization-time-zones" value={timeZone} onChange={(event) => setTimeZone(event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-[#184aa2] focus:outline-none" />
                        <datalist id="organization-time-zones">{TIME_ZONE_SUGGESTIONS.map((zone) => <option key={zone} value={zone} />)}</datalist>
                        <p className="mt-1 text-xs leading-5 text-gray-500">Use an IANA time zone such as Africa/Lagos.</p>
                    </div>
                    {sectionError.regional ? (
                        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
                            {sectionError.regional}
                            <button type="button" onClick={() => void query.refetch()} className="ml-2 font-semibold underline">
                                Refresh settings
                            </button>
                        </p>
                    ) : null}
                    <div className="sm:col-span-2">
                        <button type="submit" disabled={update.isPending} className="inline-flex items-center gap-2 rounded-md bg-[#003B6D] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><FiSave aria-hidden="true" />{update.isPending ? 'Saving…' : 'Save support and region'}</button>
                    </div>
                </form>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="vacancy-defaults-heading">
                <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-blue-50 text-[#184aa2]"><FiBriefcase /></span>
                    <div>
                        <h2 id="vacancy-defaults-heading" className="text-lg font-semibold text-gray-950">Vacancy creation defaults</h2>
                        <p className="mt-1 text-sm text-gray-600">These initialize new forms only. Staff can override them before saving, and existing vacancies never change.</p>
                    </div>
                </div>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    void save('vacancy', { defaultJobStatus, defaultDeadlineMode })
                }} className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="default-job-status" className="text-sm font-medium text-gray-800">Initial vacancy status</label>
                        <select id="default-job-status" value={defaultJobStatus} onChange={(event) => setDefaultJobStatus(event.target.value as 'Draft' | 'Open')} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5">
                            <option value="Draft">Draft — private until published</option>
                            <option value="Open">Open — publish immediately</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="default-deadline-mode" className="text-sm font-medium text-gray-800">Initial deadline mode</label>
                        <select id="default-deadline-mode" value={defaultDeadlineMode} onChange={(event) => setDefaultDeadlineMode(event.target.value as 'none' | 'required')} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5">
                            <option value="none">No deadline</option>
                            <option value="required">Ask for a deadline</option>
                        </select>
                    </div>
                    {sectionError.vacancy ? (
                        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
                            {sectionError.vacancy}
                            <button type="button" onClick={() => void query.refetch()} className="ml-2 font-semibold underline">
                                Refresh settings
                            </button>
                        </p>
                    ) : null}
                    <div className="sm:col-span-2">
                        <button type="submit" disabled={update.isPending} className="inline-flex items-center gap-2 rounded-md bg-[#003B6D] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><FiSave aria-hidden="true" />{update.isPending ? 'Saving…' : 'Save vacancy defaults'}</button>
                    </div>
                </form>
            </section>

            {lastUpdated ? (
                <p className="flex items-center gap-2 text-xs text-gray-500"><FiClock aria-hidden="true" />Last updated {lastUpdated}{query.data.updatedBy?.name ? ` by ${query.data.updatedBy.name}` : ''}.</p>
            ) : null}
        </div>
    )
}

const AdminSettingsClient = () => {
    const userQuery = useUser()
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const isSuperAdmin = userQuery.data?.role === 'super-admin'
    const section = isSuperAdmin && searchParams.get('section') === 'organization'
        ? 'organization'
        : 'personal'

    const setSection = (next: 'personal' | 'organization') => {
        const params = new URLSearchParams(searchParams.toString())
        if (next === 'organization') params.set('section', 'organization')
        else params.delete('section')
        router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false })
    }

    return (
        <div className="mx-auto max-w-5xl">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-950">Settings</h1>
                <p className="mt-2 max-w-2xl text-gray-600">Manage your staff account and the organization defaults available to your role.</p>
            </header>

            {isSuperAdmin ? (
                <div className="mt-6 flex w-fit rounded-lg border border-gray-200 bg-white p-1" role="tablist" aria-label="Settings sections">
                    <button type="button" role="tab" aria-selected={section === 'personal'} onClick={() => setSection('personal')} className={`rounded-md px-4 py-2 text-sm font-semibold ${section === 'personal' ? 'bg-[#003B6D] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Personal</button>
                    <button type="button" role="tab" aria-selected={section === 'organization'} onClick={() => setSection('organization')} className={`rounded-md px-4 py-2 text-sm font-semibold ${section === 'organization' ? 'bg-[#003B6D] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Organization</button>
                </div>
            ) : null}

            <div className="mt-6">
                {section === 'organization' ? <OrganizationSettingsPanel /> : <PersonalSettings />}
            </div>
        </div>
    )
}

export default AdminSettingsClient
