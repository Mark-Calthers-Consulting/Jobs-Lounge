'use client'

import { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiX } from 'react-icons/fi'

import AcquisitionFields from './AcquisitionFields'
import JobInterestFields from './JobInterestFields'
import {
    useSaveOnboardingAcquisition,
    useSaveOnboardingInterests,
    useSnoozeCandidateOnboarding,
} from '@/hooks/useCandidateOnboarding'
import type { AcquisitionSource, CandidateOnboarding } from '@/types/types'
import type { Category } from '@/constants/enums'

type Props = {
    open: boolean
    onboarding: CandidateOnboarding
    onCloseForVisit: () => void
}

const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
].join(',')

const messageFrom = (error: unknown, fallback: string) => (
    error instanceof Error ? error.message : fallback
)

const CandidateOnboardingDialog = ({ open, onboarding, onCloseForVisit }: Props) => {
    const dialogRef = useRef<HTMLDivElement>(null)
    const previouslyFocused = useRef<HTMLElement | null>(null)
    const interestsMutation = useSaveOnboardingInterests()
    const acquisitionMutation = useSaveOnboardingAcquisition()
    const snoozeMutation = useSnoozeCandidateOnboarding()
    const [step, setStep] = useState<1 | 2>(onboarding.questionnaire.currentStep)
    const [categories, setCategories] = useState<Category[]>(onboarding.questionnaire.interests.categories)
    const [openToAny, setOpenToAny] = useState(onboarding.questionnaire.interests.openToAny)
    const [source, setSource] = useState<AcquisitionSource | undefined>(onboarding.questionnaire.acquisition.source)
    const [detail, setDetail] = useState(onboarding.questionnaire.acquisition.detail || '')
    const [error, setError] = useState('')

    const pending = interestsMutation.isPending || acquisitionMutation.isPending || snoozeMutation.isPending

    useEffect(() => {
        if (!open) return
        setStep(onboarding.questionnaire.currentStep)
        setCategories(onboarding.questionnaire.interests.categories)
        setOpenToAny(onboarding.questionnaire.interests.openToAny)
        setSource(onboarding.questionnaire.acquisition.source)
        setDetail(onboarding.questionnaire.acquisition.detail || '')
        setError('')
    }, [open, onboarding])

    useEffect(() => {
        if (!open) return
        previouslyFocused.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
        const dialog = dialogRef.current
        const firstFocusable = dialog?.querySelector<HTMLElement>(focusableSelector)
        window.requestAnimationFrame(() => firstFocusable?.focus())

        return () => previouslyFocused.current?.focus()
    }, [open])

    const snooze = async () => {
        if (pending) return
        setError('')
        try {
            await snoozeMutation.mutateAsync(step)
            onCloseForVisit()
        } catch (caught) {
            setError(messageFrom(caught, 'Unable to save your progress. Please try again.'))
        }
    }

    useEffect(() => {
        if (!open) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                void snooze()
                return
            }
            if (event.key !== 'Tab') return
            const elements = Array.from(
                dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) || [],
            )
            if (elements.length === 0) return
            const first = elements[0]
            const last = elements[elements.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
        // `snooze` deliberately uses the current render's step and pending state.
    }, [open, step, pending]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!open) return null

    const saveInterests = async () => {
        setError('')
        if (!openToAny && categories.length === 0) {
            setError('Choose at least one category or select Open to any category.')
            return
        }
        try {
            await interestsMutation.mutateAsync({ categories, openToAny })
            setStep(2)
        } catch (caught) {
            setError(messageFrom(caught, 'Unable to save your job interests.'))
        }
    }

    const finish = async () => {
        setError('')
        if (!source) {
            setError('Choose an option to continue.')
            return
        }
        if (source === 'other' && !detail.trim()) {
            setError('Tell us where you heard about Jobs Lounge.')
            return
        }
        try {
            await acquisitionMutation.mutateAsync({
                source,
                ...(detail.trim() ? { detail: detail.trim() } : {}),
            })
            onCloseForVisit()
        } catch (caught) {
            setError(messageFrom(caught, 'Unable to finish account setup.'))
        }
    }

    return (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 py-6" onMouseDown={(event) => {
            if (event.target === event.currentTarget) void snooze()
        }}>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="candidate-onboarding-title"
                aria-describedby="candidate-onboarding-description"
                className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
            >
                <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
                    <div>
                        <p className="text-xs font-semibold text-[#184aa2]">Step {step} of 2</p>
                        <h2 id="candidate-onboarding-title" className="mt-1 text-xl font-bold text-slate-950">
                            Personalize your Jobs Lounge experience
                        </h2>
                        <p id="candidate-onboarding-description" className="mt-1 text-sm text-slate-600">
                            Two quick questions help us make your dashboard more useful.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void snooze()}
                        disabled={pending}
                        aria-label="Skip setup for now"
                        className="grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                    >
                        <FiX aria-hidden="true" size={20} />
                    </button>
                </header>

                <div className="px-5 py-5 sm:px-7 sm:py-6">
                    {step === 1 ? (
                        <JobInterestFields
                            categories={categories}
                            openToAny={openToAny}
                            disabled={pending}
                            error={error || undefined}
                            onChange={(nextCategories, nextOpenToAny) => {
                                setCategories(nextCategories)
                                setOpenToAny(nextOpenToAny)
                                setError('')
                            }}
                        />
                    ) : (
                        <AcquisitionFields
                            source={source}
                            detail={detail}
                            disabled={pending}
                            error={error || undefined}
                            onChange={(nextSource, nextDetail) => {
                                setSource(nextSource)
                                setDetail(nextDetail)
                                setError('')
                            }}
                        />
                    )}
                </div>

                <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <button
                        type="button"
                        onClick={() => void snooze()}
                        disabled={pending}
                        className="min-h-10 px-2 text-sm font-semibold text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                    >
                        {snoozeMutation.isPending ? 'Saving…' : 'Skip for now'}
                    </button>
                    <div className="flex gap-3">
                        {step === 2 ? (
                            <button
                                type="button"
                                onClick={() => { setError(''); setStep(1) }}
                                disabled={pending}
                                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                            >
                                <FiArrowLeft aria-hidden="true" /> Back
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => void (step === 1 ? saveInterests() : finish())}
                            disabled={pending}
                            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#184aa2] px-5 text-sm font-semibold text-white hover:bg-[#123d87] disabled:cursor-wait disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                        >
                            {interestsMutation.isPending || acquisitionMutation.isPending
                                ? 'Saving…'
                                : step === 1 ? 'Continue' : 'Finish setup'}
                            {!pending ? <FiArrowRight aria-hidden="true" /> : null}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default CandidateOnboardingDialog
