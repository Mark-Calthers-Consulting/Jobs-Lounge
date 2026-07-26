'use client'

import { APPLICATION_STATUSES } from '@/constants/enums'
import { useAdminCandidate, useCandidateApplications } from '@/hooks/useAdmin'
import PaginationControls from '@/components/PaginationControls'
import Link from 'next/link'
import { useState } from 'react'
import { FiArrowLeft, FiExternalLink, FiMail, FiPhone } from 'react-icons/fi'

const formatDate = (value?: string, options?: Intl.DateTimeFormatOptions) => value
    ? new Date(value).toLocaleDateString('en-NG', options || { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not provided'

const displayValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return 'Not provided'
    if (typeof value === 'string') return value.replaceAll('-', ' ')
    return String(value)
}

const safeHttpUrl = (value?: string) => {
    if (!value) return undefined
    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined
    } catch {
        return undefined
    }
}

const Detail = ({ label, value }: { label: string; value: unknown }) => (
    <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{displayValue(value)}</dd>
    </div>
)

const DocumentLink = ({ href, children }: { href?: string; children: string }) => {
    const safeHref = safeHttpUrl(href)
    return safeHref ? (
        <a href={safeHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#184aa2] hover:underline">
            {children}<FiExternalLink aria-hidden="true" />
        </a>
    ) : <span className="text-sm text-gray-500">{children} not provided</span>
}

const CandidateProfileClient = ({ candidateId }: { candidateId: string }) => {
    const [applicationPage, setApplicationPage] = useState(1)
    const [applicationStatus, setApplicationStatus] = useState('')
    const candidateQuery = useAdminCandidate(candidateId)
    const applicationsQuery = useCandidateApplications(
        candidateId,
        applicationPage,
        applicationStatus || undefined,
    )

    if (candidateQuery.isLoading) return <p role="status">Loading candidate profile…</p>
    if (candidateQuery.isError || !candidateQuery.data) {
        return (
            <div className="space-y-4">
                <Link href="/admin-center/candidates" className="inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline"><FiArrowLeft aria-hidden="true" />Back to candidates</Link>
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{candidateQuery.error?.message || 'Unable to load candidate.'}</p>
            </div>
        )
    }

    const { candidate, applicationSummary } = candidateQuery.data
    const completion = candidate.profileCompletion

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <Link href="/admin-center/candidates" className="inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]">
                <FiArrowLeft aria-hidden="true" />Back to candidates
            </Link>

            <header className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">{candidate.name || 'Unnamed candidate'}</h1>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${completion.complete ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {completion.complete ? 'Profile complete' : `${completion.percentage}% complete`}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">Joined {formatDate(candidate.createdAt)} · Updated {formatDate(candidate.updatedAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href={`mailto:${candidate.email}`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"><FiMail aria-hidden="true" />Email</a>
                        <a href={`tel:${candidate.telephone}`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"><FiPhone aria-hidden="true" />Call</a>
                        {candidate.whatsapp && <a href={`https://wa.me/${candidate.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md bg-[#184aa2] px-3 py-2 text-sm font-semibold text-white hover:bg-[#123d87]">WhatsApp</a>}
                    </div>
                </div>
            </header>

            <section aria-labelledby="application-summary-title" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h2 id="application-summary-title" className="text-sm text-gray-500">All applications</h2>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{applicationSummary.total}</p>
                </div>
                {APPLICATION_STATUSES.map((status) => (
                    <div key={status} className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm capitalize text-gray-500">{status}</p>
                        <p className="mt-2 text-2xl font-bold text-gray-950">{applicationSummary.byStatus[status]}</p>
                    </div>
                ))}
            </section>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                        <h2 className="text-lg font-semibold text-gray-950">Professional profile</h2>
                        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Detail label="Highest education" value={candidate.highestEducation} />
                            <Detail label="Post-NYSC experience" value={candidate.postNyscExperience !== undefined ? `${candidate.postNyscExperience} years` : undefined} />
                            <Detail label="NYSC status" value={candidate.nyscStatus} />
                            <Detail label="NYSC completion year" value={candidate.yearCompletedNysc} />
                        </dl>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div><h2 className="text-lg font-semibold text-gray-950">Application history</h2><p className="mt-1 text-sm text-gray-600">Read-only history for this candidate.</p></div>
                            <label className="text-sm font-medium text-gray-700">
                                <span className="sr-only">Filter application history by status</span>
                                <select
                                    value={applicationStatus}
                                    onChange={(event) => {
                                        setApplicationStatus(event.target.value)
                                        setApplicationPage(1)
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 capitalize"
                                >
                                    <option value="">All statuses</option>
                                    {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </label>
                        </div>
                        {applicationsQuery.isLoading && <p role="status" className="p-6 text-gray-600">Loading applications…</p>}
                        {applicationsQuery.isError && <p role="alert" className="m-5 rounded bg-red-50 p-3 text-red-700">{applicationsQuery.error.message}</p>}
                        {!applicationsQuery.isLoading && !applicationsQuery.isError && (
                            <>
                                <div className="divide-y divide-gray-100">
                                    {applicationsQuery.data?.data.map((application) => (
                                        <article key={application._id} className="p-5">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-950">{application.job?.title || 'Vacancy no longer available'}</h3>
                                                    <p className="mt-1 text-sm text-gray-600">{application.job?.company?.name || 'Company not available'} · Applied {formatDate(application.createdAt)}</p>
                                                </div>
                                                <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold capitalize text-gray-700">{application.status}</span>
                                            </div>
                                            {application.note && <div className="mt-4 rounded-md bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Candidate note</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{application.note}</p></div>}
                                            <div className="mt-4 flex flex-wrap gap-4">
                                                <DocumentLink href={application.cvLink}>Submitted CV</DocumentLink>
                                                {application.coverLetterLink && <DocumentLink href={application.coverLetterLink}>Submitted cover letter</DocumentLink>}
                                            </div>
                                        </article>
                                    ))}
                                    {!applicationsQuery.data?.data.length && <p className="p-8 text-center text-gray-500">No applications found.</p>}
                                </div>
                                <PaginationControls pagination={applicationsQuery.data?.pagination} onPageChange={setApplicationPage} />
                            </>
                        )}
                    </section>
                </div>

                <aside className="space-y-5">
                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="font-semibold text-gray-950">Contact</h2>
                        <dl className="mt-4 space-y-4">
                            <Detail label="Email" value={candidate.email} />
                            <Detail label="Telephone" value={candidate.telephone} />
                            <Detail label="WhatsApp" value={candidate.whatsapp} />
                        </dl>
                    </section>
                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="font-semibold text-gray-950">Documents</h2>
                        <div className="mt-4 flex flex-col items-start gap-3">
                            <DocumentLink href={candidate.cvLink}>Profile CV</DocumentLink>
                            <DocumentLink href={candidate.coverLetterLink}>Profile cover letter</DocumentLink>
                        </div>
                    </section>
                    <details className="group rounded-xl border border-gray-200 bg-white p-5">
                        <summary className="cursor-pointer font-semibold text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]">Personal details</summary>
                        <p className="mt-2 text-xs text-gray-500">Candidate-submitted optional information.</p>
                        <dl className="mt-5 space-y-4">
                            <Detail label="Other name" value={candidate.otherName} />
                            <Detail label="Gender" value={candidate.gender} />
                            <Detail label="Date of birth" value={candidate.dob ? formatDate(candidate.dob) : undefined} />
                            <Detail label="Marital status" value={candidate.maritalStatus} />
                            <Detail label="Residential address" value={candidate.residentialAddress} />
                        </dl>
                    </details>
                </aside>
            </div>
        </div>
    )
}

export default CandidateProfileClient
