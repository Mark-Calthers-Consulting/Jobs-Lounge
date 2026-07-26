'use client'

import { APPLICATION_STATUSES, type ApplicationStatus } from '@/constants/enums'
import { useCandidateFilterOptions, useGetJobCandidates } from '@/hooks/useAdmin'
import type { CandidateListFilters } from '@/types/types'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiFilter, FiSearch, FiX } from 'react-icons/fi'
import PaginationControls from './PaginationControls'

const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#184aa2] focus:ring-2 focus:ring-[#184aa2]/20'

const numberParam = (value: string | null) => {
    if (!value || !/^\d+$/.test(value)) return undefined
    return Number(value)
}

const formatDate = (value?: string) => value
    ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

const experienceLabel = (years?: number) => {
    if (years === undefined) return 'Not provided'
    return `${years} ${years === 1 ? 'year' : 'years'}`
}

const CandidatesGrid = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')
    const [jobOptionSearch, setJobOptionSearch] = useState('')
    const [debouncedJobSearch, setDebouncedJobSearch] = useState('')

    const updateParams = (updates: Record<string, string | undefined>, resetPage = true) => {
        const params = new URLSearchParams(searchParams.toString())
        for (const [key, value] of Object.entries(updates)) {
            if (value) params.set(key, value)
            else params.delete(key)
        }
        if (resetPage) params.delete('page')
        const query = params.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }

    const urlSearchValue = searchParams.get('search') ?? ''
    useEffect(() => {
        setSearchValue(urlSearchValue)
    }, [urlSearchValue])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const trimmed = searchValue.trim()
            if (!trimmed || trimmed.length >= 3) {
                updateParams({ search: trimmed || undefined })
            }
        }, 350)
        return () => window.clearTimeout(timer)
        // updateParams deliberately reads the latest URL when the timer executes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const trimmed = jobOptionSearch.trim()
            setDebouncedJobSearch(trimmed.length >= 3 ? trimmed : '')
        }, 350)
        return () => window.clearTimeout(timer)
    }, [jobOptionSearch])

    const filters: CandidateListFilters = {
        page: numberParam(searchParams.get('page')) ?? 1,
        limit: 20,
        search: searchParams.get('search') || undefined,
        profileCompleted: searchParams.get('profileCompleted') === 'true'
            ? true
            : searchParams.get('profileCompleted') === 'false'
                ? false
                : undefined,
        applicationStatus: (searchParams.get('applicationStatus') || undefined) as ApplicationStatus | undefined,
        jobId: searchParams.get('jobId') || undefined,
        education: searchParams.get('education') || undefined,
        experienceMin: numberParam(searchParams.get('experienceMin')),
        experienceMax: numberParam(searchParams.get('experienceMax')),
        joinedFrom: searchParams.get('joinedFrom') || undefined,
        joinedTo: searchParams.get('joinedTo') || undefined,
        sort: (searchParams.get('sort') || 'newest') as CandidateListFilters['sort'],
    }
    const candidatesQuery = useGetJobCandidates(filters)
    const optionsQuery = useCandidateFilterOptions(debouncedJobSearch || undefined)
    const rows = candidatesQuery.data?.data ?? []

    const activeFilters = useMemo(() => [
        filters.profileCompleted !== undefined && {
            key: 'profileCompleted',
            label: filters.profileCompleted ? 'Profile complete' : 'Profile incomplete',
        },
        filters.applicationStatus && {
            key: 'applicationStatus',
            label: `Status: ${filters.applicationStatus}`,
        },
        filters.jobId && {
            key: 'jobId',
            label: `Vacancy: ${optionsQuery.data?.jobs.find(({ _id }) => _id === filters.jobId)?.title || 'Selected'}`,
        },
        filters.education && { key: 'education', label: filters.education },
        filters.experienceMin !== undefined && {
            key: 'experienceMin',
            label: `Min ${filters.experienceMin} years`,
        },
        filters.experienceMax !== undefined && {
            key: 'experienceMax',
            label: `Max ${filters.experienceMax} years`,
        },
        filters.joinedFrom && { key: 'joinedFrom', label: `Joined after ${filters.joinedFrom}` },
        filters.joinedTo && { key: 'joinedTo', label: `Joined before ${filters.joinedTo}` },
    ].filter(Boolean) as Array<{ key: string; label: string }>, [
        filters.profileCompleted,
        filters.applicationStatus,
        filters.jobId,
        filters.education,
        filters.experienceMin,
        filters.experienceMax,
        filters.joinedFrom,
        filters.joinedTo,
        optionsQuery.data?.jobs,
    ])

    const clearFilters = () => {
        const params = new URLSearchParams()
        if (filters.search) params.set('search', filters.search)
        router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false })
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-gray-400">
                            <FiSearch size={18} />
                        </span>
                        <label htmlFor="candidate-search" className="sr-only">Search candidates</label>
                        <input
                            id="candidate-search"
                            type="search"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            className={`${inputClass} pl-9`}
                            placeholder="Search name, email or phone…"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            aria-expanded={filtersOpen}
                            aria-controls="candidate-filters"
                            onClick={() => setFiltersOpen((open) => !open)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 lg:flex-none"
                        >
                            <FiFilter aria-hidden="true" />
                            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                            <FiChevronDown aria-hidden="true" className={filtersOpen ? 'rotate-180' : ''} />
                        </button>
                        <select
                            aria-label="Sort candidates"
                            value={filters.sort}
                            onChange={(event) => updateParams({ sort: event.target.value === 'newest' ? undefined : event.target.value })}
                            className={`${inputClass} w-auto`}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name">Name A–Z</option>
                            <option value="applications">Most applications</option>
                        </select>
                    </div>
                </div>
                {searchValue.trim().length > 0 && searchValue.trim().length < 3 && (
                    <p className="mt-2 text-xs text-gray-500">Enter at least 3 characters to search.</p>
                )}

                {filtersOpen && (
                    <div id="candidate-filters" className="mt-4 border-t border-gray-100 pt-4">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <label className="text-sm font-medium text-gray-700">
                                Profile
                                <select value={searchParams.get('profileCompleted') ?? ''} onChange={(event) => updateParams({ profileCompleted: event.target.value || undefined })} className={`${inputClass} mt-1`}>
                                    <option value="">All profiles</option>
                                    <option value="true">Complete</option>
                                    <option value="false">Incomplete</option>
                                </select>
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                                Application status
                                <select value={filters.applicationStatus ?? ''} onChange={(event) => updateParams({ applicationStatus: event.target.value || undefined })} className={`${inputClass} mt-1 capitalize`}>
                                    <option value="">Any status</option>
                                    {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </label>
                            <div>
                                <label htmlFor="candidate-job-option-search" className="text-sm font-medium text-gray-700">Applied vacancy</label>
                                <input
                                    id="candidate-job-option-search"
                                    value={jobOptionSearch}
                                    onChange={(event) => setJobOptionSearch(event.target.value)}
                                    className={`${inputClass} mt-1`}
                                    placeholder="Find a vacancy…"
                                />
                                <select aria-label="Selected vacancy" value={filters.jobId ?? ''} onChange={(event) => updateParams({ jobId: event.target.value || undefined })} className={`${inputClass} mt-2`}>
                                    <option value="">Any vacancy</option>
                                    {optionsQuery.data?.jobs.map((job) => (
                                        <option key={job._id} value={job._id}>{job.title}{job.company ? ` — ${job.company}` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <label className="text-sm font-medium text-gray-700">
                                Education
                                <select value={filters.education ?? ''} onChange={(event) => updateParams({ education: event.target.value || undefined })} className={`${inputClass} mt-1`}>
                                    <option value="">Any education</option>
                                    {optionsQuery.data?.educationLevels.map((education) => <option key={education} value={education}>{education}</option>)}
                                </select>
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                                Minimum experience
                                <input type="number" min="0" max="60" value={filters.experienceMin ?? ''} onChange={(event) => updateParams({ experienceMin: event.target.value || undefined })} className={`${inputClass} mt-1`} />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                                Maximum experience
                                <input type="number" min="0" max="60" value={filters.experienceMax ?? ''} onChange={(event) => updateParams({ experienceMax: event.target.value || undefined })} className={`${inputClass} mt-1`} />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                                Joined from
                                <input type="date" value={filters.joinedFrom ?? ''} onChange={(event) => updateParams({ joinedFrom: event.target.value || undefined })} className={`${inputClass} mt-1`} />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                                Joined to
                                <input type="date" value={filters.joinedTo ?? ''} onChange={(event) => updateParams({ joinedTo: event.target.value || undefined })} className={`${inputClass} mt-1`} />
                            </label>
                        </div>
                    </div>
                )}

                {activeFilters.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {activeFilters.map((filter) => (
                            <button key={filter.key} type="button" onClick={() => updateParams({ [filter.key]: undefined })} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                                {filter.label}<FiX aria-hidden="true" />
                            </button>
                        ))}
                        <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#184aa2] hover:underline">Clear all</button>
                    </div>
                )}
            </div>

            {candidatesQuery.isLoading && <p role="status" className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Loading candidates…</p>}
            {candidatesQuery.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{candidatesQuery.error.message}</p>}

            {!candidatesQuery.isLoading && !candidatesQuery.isError && (
                <>
                    <p className="text-sm text-gray-600" aria-live="polite">
                        {candidatesQuery.data?.pagination.total ?? 0} candidates
                    </p>

                    <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <caption className="sr-only">Candidate directory</caption>
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        {['Candidate', 'Contact', 'Education and experience', 'Profile', 'Applications', 'Joined', ''].map((heading) => (
                                            <th key={heading || 'action'} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rows.map((candidate) => (
                                        <tr key={candidate._id} className="hover:bg-gray-50/70">
                                            <td className="px-4 py-4"><p className="font-semibold text-gray-950">{candidate.name || 'Unnamed candidate'}</p><p className="mt-0.5 text-xs text-gray-500">Updated {formatDate(candidate.updatedAt)}</p></td>
                                            <td className="px-4 py-4 text-sm"><a className="block text-[#184aa2] hover:underline" href={`mailto:${candidate.email}`}>{candidate.email}</a><a className="mt-1 block text-gray-600 hover:underline" href={`tel:${candidate.telephone}`}>{candidate.telephone}</a></td>
                                            <td className="px-4 py-4 text-sm"><p>{candidate.highestEducation || 'Not provided'}</p><p className="mt-1 text-gray-500">{experienceLabel(candidate.postNyscExperience)}</p></td>
                                            <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${candidate.profileCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{candidate.profileCompleted ? 'Complete' : 'Incomplete'}</span></td>
                                            <td className="px-4 py-4 text-sm"><span className="font-semibold">{candidate.applicationCount}</span><p className="mt-1 text-xs text-gray-500">Latest {formatDate(candidate.latestApplicationAt)}</p></td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{formatDate(candidate.createdAt)}</td>
                                            <td className="px-4 py-4 text-right"><Link href={`/admin-center/candidates/${candidate._id}`} className="whitespace-nowrap text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]">View candidate</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!rows.length && <p className="p-10 text-center text-gray-500">No candidates match these filters.</p>}
                    </div>

                    <div className="grid gap-3 md:hidden">
                        {rows.map((candidate) => (
                            <article key={candidate._id} className="rounded-xl border border-gray-200 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div><h2 className="font-semibold text-gray-950">{candidate.name || 'Unnamed candidate'}</h2><p className="mt-1 text-sm text-gray-600">{candidate.highestEducation || 'Education not provided'}</p></div>
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${candidate.profileCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{candidate.profileCompleted ? 'Complete' : 'Incomplete'}</span>
                                </div>
                                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div><dt className="text-gray-500">Experience</dt><dd className="mt-0.5 font-medium">{experienceLabel(candidate.postNyscExperience)}</dd></div>
                                    <div><dt className="text-gray-500">Applications</dt><dd className="mt-0.5 font-medium">{candidate.applicationCount}</dd></div>
                                    <div><dt className="text-gray-500">Joined</dt><dd className="mt-0.5 font-medium">{formatDate(candidate.createdAt)}</dd></div>
                                </dl>
                                <Link href={`/admin-center/candidates/${candidate._id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#184aa2] px-4 text-sm font-semibold text-white">View candidate</Link>
                            </article>
                        ))}
                        {!rows.length && <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">No candidates match these filters.</p>}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white">
                        <PaginationControls pagination={candidatesQuery.data?.pagination} onPageChange={(page) => updateParams({ page: String(page) }, false)} />
                    </div>
                </>
            )}
        </div>
    )
}

export default CandidatesGrid
