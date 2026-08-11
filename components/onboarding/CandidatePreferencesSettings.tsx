'use client'

import { useEffect, useState } from 'react'

import AcquisitionFields from './AcquisitionFields'
import JobInterestFields from './JobInterestFields'
import {
    useCandidateOnboarding,
    useSaveOnboardingAcquisition,
    useSaveOnboardingInterests,
} from '@/hooks/useCandidateOnboarding'
import type { AcquisitionSource } from '@/types/types'
import type { Category } from '@/constants/enums'

const CandidatePreferencesSettings = () => {
    const onboardingQuery = useCandidateOnboarding()
    const interestsMutation = useSaveOnboardingInterests()
    const acquisitionMutation = useSaveOnboardingAcquisition()
    const [categories, setCategories] = useState<Category[]>([])
    const [openToAny, setOpenToAny] = useState(false)
    const [source, setSource] = useState<AcquisitionSource | undefined>()
    const [detail, setDetail] = useState('')
    const [interestMessage, setInterestMessage] = useState('')
    const [acquisitionMessage, setAcquisitionMessage] = useState('')

    useEffect(() => {
        if (!onboardingQuery.data) return
        setCategories(onboardingQuery.data.questionnaire.interests.categories)
        setOpenToAny(onboardingQuery.data.questionnaire.interests.openToAny)
        setSource(onboardingQuery.data.questionnaire.acquisition.source)
        setDetail(onboardingQuery.data.questionnaire.acquisition.detail || '')
    }, [onboardingQuery.data])

    if (onboardingQuery.isLoading) {
        return <p role="status" className="px-5 py-5 text-sm text-slate-600 sm:px-6">Loading personalisation settings…</p>
    }
    if (onboardingQuery.isError || !onboardingQuery.data) {
        return <p role="alert" className="px-5 py-5 text-sm text-red-700 sm:px-6">Unable to load personalisation settings.</p>
    }

    const saveInterests = async () => {
        setInterestMessage('')
        if (!openToAny && categories.length === 0) {
            setInterestMessage('Choose at least one category or select Open to any category.')
            return
        }
        try {
            await interestsMutation.mutateAsync({ categories, openToAny })
            setInterestMessage('Job interests saved.')
        } catch (error) {
            setInterestMessage(error instanceof Error ? error.message : 'Unable to save job interests.')
        }
    }

    const saveAcquisition = async () => {
        setAcquisitionMessage('')
        if (!source) {
            setAcquisitionMessage('Choose an option before saving.')
            return
        }
        if (source === 'other' && !detail.trim()) {
            setAcquisitionMessage('Tell us where you heard about Jobs Lounge.')
            return
        }
        try {
            await acquisitionMutation.mutateAsync({
                source,
                ...(detail.trim() ? { detail: detail.trim() } : {}),
            })
            setAcquisitionMessage('Response saved.')
        } catch (error) {
            setAcquisitionMessage(error instanceof Error ? error.message : 'Unable to save your response.')
        }
    }

    return (
        <div className="divide-y divide-slate-100">
            <div className="px-5 py-5 sm:px-6">
                <JobInterestFields
                    categories={categories}
                    openToAny={openToAny}
                    disabled={interestsMutation.isPending}
                    onChange={(nextCategories, nextOpenToAny) => {
                        setCategories(nextCategories)
                        setOpenToAny(nextOpenToAny)
                        setInterestMessage('')
                    }}
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void saveInterests()}
                        disabled={interestsMutation.isPending}
                        className="min-h-10 rounded-md bg-[#184aa2] px-4 text-sm font-semibold text-white hover:bg-[#123d87] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                    >
                        {interestsMutation.isPending ? 'Saving…' : 'Save job interests'}
                    </button>
                    {interestMessage ? <p role="status" className="text-sm text-slate-700">{interestMessage}</p> : null}
                </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
                <AcquisitionFields
                    source={source}
                    detail={detail}
                    disabled={acquisitionMutation.isPending}
                    onChange={(nextSource, nextDetail) => {
                        setSource(nextSource)
                        setDetail(nextDetail)
                        setAcquisitionMessage('')
                    }}
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void saveAcquisition()}
                        disabled={acquisitionMutation.isPending}
                        className="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-[#003B6D] hover:bg-slate-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                    >
                        {acquisitionMutation.isPending ? 'Saving…' : 'Save response'}
                    </button>
                    {acquisitionMessage ? <p role="status" className="text-sm text-slate-700">{acquisitionMessage}</p> : null}
                </div>
            </div>
        </div>
    )
}

export default CandidatePreferencesSettings
