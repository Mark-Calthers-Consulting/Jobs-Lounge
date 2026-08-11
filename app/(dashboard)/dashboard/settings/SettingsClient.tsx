'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
    FiArrowRight,
    FiCheckCircle,
    FiLock,
    FiMail,
    FiSend,
    FiUser,
} from 'react-icons/fi'

import NotificationSettings from '@/components/NotificationSettings'
import CandidatePreferencesSettings from '@/components/onboarding/CandidatePreferencesSettings'
import { useEmailVerificationRequest } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUsers'

const displayNameFor = (user: NonNullable<ReturnType<typeof useUser>['data']>) => (
    user.name?.trim()
    || [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || 'Candidate'
)

const SettingsClient: React.FC = () => {
    const userQuery = useUser()
    const verificationRequest = useEmailVerificationRequest()
    const [verificationMessage, setVerificationMessage] = useState<{
        tone: 'success' | 'error'
        text: string
    } | null>(null)

    if (userQuery.isLoading) {
        return <p role="status" className="text-sm text-gray-600">Loading settings…</p>
    }
    if (userQuery.isError || !userQuery.data) {
        return (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                Unable to load your settings. Refresh the page and try again.
            </div>
        )
    }

    const user = userQuery.data
    const requestVerification = async () => {
        setVerificationMessage(null)
        try {
            const message = await verificationRequest.mutateAsync()
            setVerificationMessage({ tone: 'success', text: message })
        } catch (error) {
            setVerificationMessage({
                tone: 'error',
                text: error instanceof Error ? error.message : 'Unable to send a verification email.',
            })
        }
    }

    return (
        <div className="mx-auto max-w-5xl">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-950">Settings</h1>
                <p className="mt-2 max-w-2xl text-gray-600">
                    Manage your candidate account, email preferences, and sign-in security.
                </p>
            </header>

            <div className="mt-7 space-y-6">
                <section aria-labelledby="candidate-account-heading" className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                        <div className="flex items-start gap-3">
                            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#184aa2]">
                                <FiUser size={19} />
                            </span>
                            <div>
                                <h2 id="candidate-account-heading" className="text-lg font-semibold text-gray-950">
                                    Account
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Your core account details and email status.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex min-w-0 items-start gap-3.5">
                                <span aria-hidden="true" className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-600">
                                    <FiMail size={18} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-500">Email address</p>
                                    <p className="mt-0.5 break-all font-semibold text-gray-900">{user.email}</p>
                                    <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${
                                        user.emailVerified ? 'text-emerald-700' : 'text-amber-700'
                                    }`}>
                                        {user.emailVerified ? <FiCheckCircle aria-hidden="true" /> : null}
                                        {user.emailVerified ? 'Verified' : 'Verification required'}
                                    </span>
                                </div>
                            </div>
                            {!user.emailVerified ? (
                                <button
                                    type="button"
                                    onClick={() => void requestVerification()}
                                    disabled={verificationRequest.isPending}
                                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 text-sm font-semibold text-[#003B6D] transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                                >
                                    <FiSend aria-hidden="true" />
                                    {verificationRequest.isPending ? 'Sending…' : 'Send verification email'}
                                </button>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <p className="font-semibold text-gray-900">{displayNameFor(user)}</p>
                                <p className="mt-1 text-sm text-gray-600">
                                    Personal information, experience, and application documents are managed in your profile.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/profile"
                                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                            >
                                Manage profile
                                <FiArrowRight aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    {verificationMessage ? (
                        <p
                            role={verificationMessage.tone === 'error' ? 'alert' : 'status'}
                            className={`border-t px-5 py-3 text-sm sm:px-6 ${
                                verificationMessage.tone === 'error'
                                    ? 'border-red-100 bg-red-50 text-red-800'
                                    : 'border-emerald-100 bg-emerald-50 text-emerald-800'
                            }`}
                        >
                            {verificationMessage.text}
                        </p>
                    ) : null}
                </section>

                <section aria-labelledby="candidate-personalisation-heading" className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                        <h2 id="candidate-personalisation-heading" className="text-lg font-semibold text-gray-950">
                            Personalisation
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Control which vacancies are prioritised in your recommendations and update how you found Jobs Lounge.
                        </p>
                    </div>
                    <CandidatePreferencesSettings />
                </section>

                <section aria-labelledby="candidate-email-heading" className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                        <h2 id="candidate-email-heading" className="text-lg font-semibold text-gray-950">
                            Email preferences
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Choose which optional emails you want to receive. Changes save immediately.
                        </p>
                    </div>
                    <NotificationSettings idPrefix="candidate-email" />
                </section>

                <section aria-labelledby="candidate-security-heading" className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-start gap-3.5">
                            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#184aa2]">
                                <FiLock size={19} />
                            </span>
                            <div>
                                <h2 id="candidate-security-heading" className="text-lg font-semibold text-gray-950">
                                    Password
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                                    We&apos;ll email you a secure link to choose a new password. Completing the reset signs out your other sessions.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/forgot-password?area=candidate"
                            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-[#003B6D] px-4 text-sm font-semibold text-white transition hover:bg-[#002f57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                        >
                            Reset password
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default SettingsClient
