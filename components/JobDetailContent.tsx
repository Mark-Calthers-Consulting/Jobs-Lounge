'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { FiArrowLeft, FiBriefcase, FiCalendar, FiClock, FiExternalLink, FiMapPin } from 'react-icons/fi'
import { MdOutlineWorkOutline, MdWorkspacePremium } from 'react-icons/md'

import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import type { Job } from '@/types/types'
import { formatJobDeadline, isJobDeadlinePast } from '@/utils/jobDeadline'

type JobDetailContentProps = {
    job: Job
    sidebarContent?: ReactNode
    backHref?: string
}

const formatSalary = (job: Job) => {
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

const formatPostedDate = (createdAt: string, timeZone: string) => {
    const value = new Date(createdAt)
    if (Number.isNaN(value.getTime())) return null

    return new Intl.DateTimeFormat('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone,
    }).format(value)
}

const experienceLabel = (experience: number) => {
    if (experience === 0) return 'No experience required'
    return `${experience} ${experience === 1 ? 'year' : 'years'} minimum`
}

const DetailList = ({ items }: { items: string[] }) => (
    <ul className="divide-y divide-slate-200 border-y border-slate-200 text-[0.975rem] leading-7 text-slate-700">
        {items.map((item, index) => (
            <li className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3 py-3.5" key={`${item}-${index}`}>
                <span aria-hidden="true" className="mt-[0.82rem] h-px w-3 bg-[#184aa2]" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
)

const JobDetailContent = ({ job, sidebarContent, backHref }: JobDetailContentProps) => {
    const { timeZone } = usePlatformSettings()
    const deadlinePassed = isJobDeadlinePast(job)
    const postedDate = formatPostedDate(job.createdAt, timeZone)
    const companyWebsite = job.company.website
    const responsibilities = job.responsibilities ?? []
    const requirements = job.requirements ?? []
    const skills = job.skills ?? []
    const benefits = job.benefits ?? []

    const overviewItems = [
        { label: 'Location', value: job.location, icon: FiMapPin },
        { label: 'Work arrangement', value: job.workMode, icon: MdOutlineWorkOutline },
        { label: 'Employment type', value: job.jobType, icon: FiBriefcase },
        { label: 'Experience level', value: job.level, icon: MdWorkspacePremium },
        {
            label: 'Experience',
            value: Number.isFinite(job.experience) ? experienceLabel(job.experience) : 'Not specified',
            icon: FiClock,
        },
        ...(!deadlinePassed ? [{
            label: 'Application deadline',
            value: job.deadline ? formatJobDeadline(job.deadline, timeZone) : 'No application deadline',
            icon: FiCalendar,
        }] : []),
    ]

    return (
        <article className="bg-white text-slate-950">
            <header className="border-b border-slate-200 bg-slate-50/70">
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
                    {backHref ? (
                        <Link
                            href={backHref}
                            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline focus-visible:rounded-sm"
                        >
                            <FiArrowLeft aria-hidden="true" />
                            Back to vacancies
                        </Link>
                    ) : null}

                    <div className="max-w-4xl">
                        <p className="mb-2 text-sm font-semibold text-[#184aa2]">{job.category}</p>
                        <h1 className="break-words text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]">
                            {job.title}
                        </h1>
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-slate-600">
                            {companyWebsite ? (
                                <a
                                    href={companyWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-[#184aa2] hover:underline"
                                >
                                    {job.company.name}
                                    <FiExternalLink aria-hidden="true" className="text-sm" />
                                    <span className="sr-only">(opens in a new tab)</span>
                                </a>
                            ) : (
                                <span className="font-semibold text-slate-800">{job.company.name}</span>
                            )}
                            <span aria-hidden="true" className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1.5">
                                <FiMapPin aria-hidden="true" />
                                {job.location}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">•</span>
                            <span>{job.workMode}</span>
                            {postedDate ? (
                                <>
                                    <span aria-hidden="true" className="text-slate-300">•</span>
                                    <span>Posted {postedDate}</span>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 lg:px-12 lg:py-14">
                <div className="min-w-0 max-w-3xl">
                    <section aria-labelledby="job-description-title">
                        <h2 id="job-description-title" className="text-2xl font-bold tracking-tight text-slate-950">
                            About the role
                        </h2>
                        <p className="mt-4 whitespace-pre-wrap text-[0.975rem] leading-7 text-slate-700">
                            {job.description}
                        </p>
                    </section>

                    {responsibilities.length > 0 ? (
                        <section aria-labelledby="job-responsibilities-title" className="mt-10 border-t border-slate-200 pt-9">
                            <h2 id="job-responsibilities-title" className="mb-4 text-2xl font-bold tracking-tight text-slate-950">
                                Responsibilities
                            </h2>
                            <DetailList items={responsibilities} />
                        </section>
                    ) : null}

                    {requirements.length > 0 ? (
                        <section aria-labelledby="job-requirements-title" className="mt-10 border-t border-slate-200 pt-9">
                            <h2 id="job-requirements-title" className="mb-4 text-2xl font-bold tracking-tight text-slate-950">
                                Requirements
                            </h2>
                            <DetailList items={requirements} />
                        </section>
                    ) : null}

                    {skills.length > 0 ? (
                        <section aria-labelledby="job-skills-title" className="mt-10 border-t border-slate-200 pt-9">
                            <h2 id="job-skills-title" className="mb-4 text-2xl font-bold tracking-tight text-slate-950">
                                Skills
                            </h2>
                            <ul className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <li
                                        key={`${skill}-${index}`}
                                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                                    >
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {benefits.length > 0 ? (
                        <section aria-labelledby="job-benefits-title" className="mt-10 border-t border-slate-200 pt-9">
                            <h2 id="job-benefits-title" className="mb-4 text-2xl font-bold tracking-tight text-slate-950">
                                Benefits
                            </h2>
                            <DetailList items={benefits} />
                        </section>
                    ) : null}
                </div>

                <aside aria-label="Job summary and actions" className="order-first min-w-0 lg:order-none">
                    <div className="space-y-5 lg:sticky lg:top-6">
                        <section className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm font-medium text-slate-500">Salary</p>
                            <p className="mt-1 text-xl font-bold text-slate-950">{formatSalary(job)}</p>

                            <h2 className="mt-6 border-t border-slate-200 pt-5 text-base font-bold text-slate-950">
                                Job overview
                            </h2>
                            <dl className="mt-4 space-y-4">
                                {overviewItems.map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3">
                                        <Icon aria-hidden="true" className="mt-0.5 text-lg text-[#184aa2]" />
                                        <div className="min-w-0">
                                            <dt className="text-xs font-medium text-slate-500">{label}</dt>
                                            <dd className="mt-0.5 break-words text-sm font-semibold leading-5 text-slate-800">{value}</dd>
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        {sidebarContent}
                    </div>
                </aside>
            </div>
        </article>
    )
}

export default JobDetailContent
