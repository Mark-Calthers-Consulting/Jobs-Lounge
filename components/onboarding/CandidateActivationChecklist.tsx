'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiCheck, FiChevronDown, FiChevronUp, FiMail, FiSliders, FiUser } from 'react-icons/fi'

import { useEmailVerificationRequest } from '@/hooks/useAuth'
import { useUpdateOnboardingChecklist } from '@/hooks/useCandidateOnboarding'
import type { CandidateOnboarding } from '@/types/types'

type Props = {
    onboarding: CandidateOnboarding
    onPersonalize: () => void
}

const itemIcon = {
    personalize: FiSliders,
    'verify-email': FiMail,
    'complete-profile': FiUser,
}

const CandidateActivationChecklist = ({ onboarding, onPersonalize }: Props) => {
    const checklistMutation = useUpdateOnboardingChecklist()
    const verificationRequest = useEmailVerificationRequest()
    const [message, setMessage] = useState('')
    const { checklist } = onboarding

    if (checklist.complete) return null

    const toggleCollapsed = () => {
        setMessage('')
        checklistMutation.mutate(!checklist.collapsed, {
            onError: (error) => setMessage(error instanceof Error ? error.message : 'Unable to update the checklist.'),
        })
    }

    return (
        <section aria-labelledby="activation-checklist-heading" className="my-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 id="activation-checklist-heading" className="font-semibold text-slate-950">Set up your account</h2>
                        <span className="text-xs font-medium text-slate-500">
                            {checklist.completedCount} of {checklist.totalCount} complete
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">A few steps will help you get more from Jobs Lounge.</p>
                </div>
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    disabled={checklistMutation.isPending}
                    aria-expanded={!checklist.collapsed}
                    aria-controls="activation-checklist-items"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-[#184aa2] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                >
                    {checklist.collapsed ? 'Show steps' : 'Hide steps'}
                    {checklist.collapsed ? <FiChevronDown aria-hidden="true" /> : <FiChevronUp aria-hidden="true" />}
                </button>
            </div>

            {!checklist.collapsed ? (
                <div id="activation-checklist-items" className="border-t border-slate-100 px-5 py-2 sm:px-6">
                    {checklist.items.map((item) => {
                        const Icon = itemIcon[item.id]
                        return (
                            <div key={item.id} className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`grid size-9 shrink-0 place-items-center rounded-full ${item.complete ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {item.complete ? <FiCheck aria-hidden="true" /> : <Icon aria-hidden="true" />}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-semibold ${item.complete ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.label}</p>
                                        {item.id === 'complete-profile' && !item.complete ? (
                                            <p className="mt-0.5 text-xs text-slate-500">{item.percentage ?? 0}% complete</p>
                                        ) : null}
                                    </div>
                                </div>
                                {!item.complete && item.id === 'personalize' ? (
                                    <button type="button" onClick={onPersonalize} className="self-start text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] sm:self-auto">
                                        Personalize
                                    </button>
                                ) : null}
                                {!item.complete && item.id === 'verify-email' ? (
                                    <button
                                        type="button"
                                        disabled={verificationRequest.isPending}
                                        onClick={() => {
                                            setMessage('')
                                            verificationRequest.mutate(undefined, {
                                                onSuccess: setMessage,
                                                onError: (error) => setMessage(error instanceof Error ? error.message : 'Unable to send the email.'),
                                            })
                                        }}
                                        className="self-start text-sm font-semibold text-[#184aa2] hover:underline disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] sm:self-auto"
                                    >
                                        {verificationRequest.isPending ? 'Sending…' : 'Send verification email'}
                                    </button>
                                ) : null}
                                {!item.complete && item.id === 'complete-profile' ? (
                                    <Link href="/dashboard/profile" className="self-start text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] sm:self-auto">
                                        Continue profile
                                    </Link>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            ) : null}
            {message ? <p role="status" className="border-t border-slate-100 px-5 py-3 text-sm text-slate-700 sm:px-6">{message}</p> : null}
        </section>
    )
}

export default CandidateActivationChecklist
