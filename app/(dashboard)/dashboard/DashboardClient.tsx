'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CiBookmark, CiMoneyBill } from 'react-icons/ci'
import { IoCheckmarkCircleOutline, IoLocationOutline } from 'react-icons/io5'
import { FiArrowRight } from 'react-icons/fi'

import CandidateActivationChecklist from '@/components/onboarding/CandidateActivationChecklist'
import CandidateOnboardingDialog from '@/components/onboarding/CandidateOnboardingDialog'
import { useCandidateOnboarding } from '@/hooks/useCandidateOnboarding'
import { useGetSavedJobs, useUser } from '@/hooks/useUsers'
import { useRecommendedJobs } from '@/hooks/useVacancies'
import type { RecommendedJob } from '@/types/types'

const formatSalary = (job: RecommendedJob) => {
    const minimum = job.salary?.min
    const maximum = job.salary?.max
    if (minimum === undefined && maximum === undefined) return 'Salary not disclosed'

    const currency = job.salary?.currency || 'NGN'
    const formatAmount = (amount: number) => {
        try {
            return new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency,
                currencyDisplay: 'narrowSymbol',
                maximumFractionDigits: 0,
            }).format(amount)
        } catch {
            return `${amount.toLocaleString('en-NG')} ${currency}`
        }
    }

    if (minimum !== undefined && maximum !== undefined) {
        return minimum === maximum
            ? formatAmount(minimum)
            : `${formatAmount(minimum)} – ${formatAmount(maximum)}`
    }
    if (minimum !== undefined) return `From ${formatAmount(minimum)}`
    return `Up to ${formatAmount(maximum as number)}`
}

const DashboardClient: React.FC = () => {
    const userQuery = useUser()
    const onboardingQuery = useCandidateOnboarding(Boolean(userQuery.data))
    const userRecommendations = useRecommendedJobs(Boolean(userQuery.data))
    const [questionnaireOpen, setQuestionnaireOpen] = useState(false)
    const [dismissedForVisit, setDismissedForVisit] = useState(false)

    const savedJobsQuery = useGetSavedJobs({
        enabled: Boolean(userQuery.data),
        limit: 1,
    })

    useEffect(() => {
        if (
            onboardingQuery.data
            && onboardingQuery.data.questionnaire.questionnaireStatus !== 'completed'
            && !dismissedForVisit
        ) {
            setQuestionnaireOpen(true)
        }
    }, [dismissedForVisit, onboardingQuery.data])

    if (userQuery.isLoading) return <p role="status">Loading dashboard…</p>
    if (userQuery.isError) {
        return <p role="alert" className="text-red-700">Unable to load your dashboard.</p>
    }

    const user = userQuery.data
    const recommendations = userRecommendations.data || []
    const personalizedCount = recommendations.filter(
        ({ recommendation }) => recommendation.kind === 'category-match',
    ).length
    const greetingName = user?.firstName || user?.name || 'there'

    return (
        <div>
            <h1 className="text-3xl font-bold">Welcome back, {greetingName}!</h1>
            <p className="my-3 text-gray-600">Here&apos;s what&apos;s happening with your job search today.</p>

            {onboardingQuery.data ? (
                <CandidateActivationChecklist
                    onboarding={onboardingQuery.data}
                    onPersonalize={() => {
                        setDismissedForVisit(false)
                        setQuestionnaireOpen(true)
                    }}
                />
            ) : null}
            {onboardingQuery.isError ? (
                <p role="alert" className="my-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    We couldn&apos;t load your account setup steps. Refresh the page to try again.
                </p>
            ) : null}

            {user && !user.cvLink ? (
                <aside className="my-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-amber-950">A CV is required to apply</h2>
                            <p className="mt-1 text-sm text-amber-800">Add a shareable CV link before submitting an application.</p>
                        </div>
                        <Link href="/dashboard/profile" className="text-sm font-semibold text-amber-900 underline underline-offset-4">
                            Add CV link
                        </Link>
                    </div>
                </aside>
            ) : null}

            <Link href="/vacancies" className="my-3 inline-block rounded p-2 shadow">Go to vacancies</Link>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Link href="/dashboard/applications?view=saved" className="flex justify-between rounded bg-white p-5 shadow ring-1 ring-black/5 transition hover:ring-[#184aa2]">
                    <div>
                        <p>Saved jobs</p>
                        <p className="text-2xl font-semibold">{savedJobsQuery.data?.pagination.total ?? 0}</p>
                    </div>
                    <CiBookmark aria-hidden="true" size={24} color="#155DFC" />
                </Link>
                <Link href="/dashboard/applications?view=applications" className="flex justify-between rounded bg-white p-5 shadow ring-1 ring-black/5 transition hover:ring-[#184aa2]">
                    <div>
                        <p>Jobs applied</p>
                        <p className="text-2xl font-semibold">{user?.applicationCount ?? 0}</p>
                    </div>
                    <IoCheckmarkCircleOutline aria-hidden="true" size={24} color="#078536" />
                </Link>
            </section>

            <section aria-labelledby="dashboard-recommendations-heading" className="mt-6">
                <div className="mb-4">
                    <h2 id="dashboard-recommendations-heading" className="text-lg font-semibold md:text-xl">
                        {personalizedCount > 0 ? 'Jobs picked for your interests' : 'Recent opportunities for you'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {personalizedCount > 0
                            ? 'Matching vacancies appear first, followed by other recent roles you have not applied to.'
                            : 'Choose job interests in your account setup to make these recommendations more personal.'}
                    </p>
                </div>
                {userRecommendations.isLoading ? <p role="status">Loading recommendations…</p> : null}
                {userRecommendations.isError ? <p role="alert" className="text-red-700">Unable to load recommendations.</p> : null}
                {!userRecommendations.isLoading && !userRecommendations.isError && recommendations.length === 0 ? (
                    <p className="rounded-lg border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600">
                        There are no new vacancies to recommend right now. Check the vacancies page for updates.
                    </p>
                ) : null}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {recommendations.map((rec: RecommendedJob) => (
                        <article
                            key={rec._id}
                            className="flex min-h-72 flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className={`text-xs font-semibold leading-5 ${rec.recommendation.kind === 'category-match' ? 'text-[#184aa2]' : 'text-slate-500'}`}>
                                    {rec.recommendation.reason}
                                </p>
                                <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                    {rec.jobType}
                                </span>
                            </div>

                            <div className="mt-5">
                                <h3 className="text-lg font-bold leading-6 text-slate-950">{rec.title}</h3>
                                <p className="mt-1.5 text-sm font-medium text-slate-600">{rec.company.name}</p>
                            </div>

                            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                                <p className="flex items-start text-sm leading-5 text-slate-600">
                                    <IoLocationOutline aria-hidden="true" className="mr-2 mt-0.5 shrink-0" />
                                    <span>{rec.location} · {rec.workMode}</span>
                                </p>
                                <p className="flex items-center text-sm font-medium text-slate-700">
                                    <CiMoneyBill aria-hidden="true" className="mr-2 shrink-0" />
                                    {formatSalary(rec)}
                                </p>
                            </div>

                            <Link
                                className="mt-auto inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-[#184aa2] px-4 text-sm font-semibold text-white hover:bg-[#123d87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                                href={`/vacancies/${rec._id}`}
                                aria-label={`View details for ${rec.title}`}
                            >
                                View details <FiArrowRight aria-hidden="true" />
                            </Link>
                        </article>
                    ))}
                </div>
            </section>

            {onboardingQuery.data ? (
                <CandidateOnboardingDialog
                    open={questionnaireOpen}
                    onboarding={onboardingQuery.data}
                    onCloseForVisit={() => {
                        setQuestionnaireOpen(false)
                        setDismissedForVisit(true)
                    }}
                />
            ) : null}
        </div>
    )
}

export default DashboardClient
