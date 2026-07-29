'use client'

import {
    useAdminVacancies,
    useDeleteAdminJob,
    useRestoreAdminJob,
    useUpdateAdminJobStatus,
} from '@/hooks/useAdmin'
import { useUser } from '@/hooks/useUsers'
import type {
    AdminJobSort,
    AdminJobSummary,
    AdminJobView,
    Job,
} from '@/types/types'
import { formatJobDeadline, isJobDeadlinePast } from '@/utils/jobDeadline'
import { hasStaffPermission } from '@/utils/staffPermissions'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    FiArchive,
    FiEdit3,
    FiMoreHorizontal,
    FiRefreshCw,
    FiSearch,
} from 'react-icons/fi'
import { toast } from 'sonner'
import Modal from './Modal'
import PaginationControls from './PaginationControls'

const ADMIN_JOB_VIEWS: AdminJobView[] = [
    'all',
    'open',
    'draft',
    'closed',
    'deadline-passed',
    'archived',
]
const ADMIN_JOB_SORTS: AdminJobSort[] = ['newest', 'oldest', 'deadline', 'applicants']

const viewTabs: Array<{
    value: AdminJobView
    label: string
    count: keyof AdminJobSummary
}> = [
    { value: 'all', label: 'All', count: 'all' },
    { value: 'open', label: 'Open', count: 'open' },
    { value: 'draft', label: 'Drafts', count: 'draft' },
    { value: 'closed', label: 'Closed', count: 'closed' },
    { value: 'deadline-passed', label: 'Deadline passed', count: 'deadlinePassed' },
    { value: 'archived', label: 'Archived', count: 'archived' },
]

const emptySummary: AdminJobSummary = {
    all: 0,
    open: 0,
    draft: 0,
    closed: 0,
    deadlinePassed: 0,
    archived: 0,
}

const statusStyle: Record<Job['status'], string> = {
    Draft: 'bg-amber-50 text-amber-800 ring-amber-200',
    Open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Closed: 'bg-gray-100 text-gray-700 ring-gray-200',
}

type Confirmation = {
    type: 'publish' | 'close' | 'archive' | 'restore'
    job: Job
} | null

const numberParam = (value: string | null) => {
    if (!value || !/^\d+$/.test(value)) return 1
    const parsed = Number(value)
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
})

const JobStatus = ({ job }: { job: Job }) => (
    <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            job.archivedAt
                ? 'bg-slate-100 text-slate-700 ring-slate-200'
                : statusStyle[job.status]
        }`}>
            {job.archivedAt ? 'Archived' : job.status}
        </span>
        {!job.archivedAt && isJobDeadlinePast(job) ? (
            <span className="text-xs font-medium text-amber-800">Deadline passed</span>
        ) : null}
    </div>
)

const JobActions = ({
    job,
    onAction,
    canArchive,
}: {
    job: Job
    onAction: (type: NonNullable<Confirmation>['type'], job: Job) => void
    canArchive: boolean
}) => {
    const menuRef = useRef<HTMLDetailsElement>(null)
    const choose = (type: NonNullable<Confirmation>['type']) => {
        menuRef.current?.removeAttribute('open')
        onAction(type, job)
    }

    if (job.archivedAt) {
        if (!canArchive) return null
        return (
            <button
                type="button"
                onClick={() => choose('restore')}
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#184aa2] px-3 py-1.5 text-xs font-semibold text-[#184aa2] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
            >
                <FiRefreshCw aria-hidden="true" />
                Restore
            </button>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/admin-center/jobs/${job._id}/edit`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
            >
                <FiEdit3 aria-hidden="true" />
                Edit
            </Link>
            <details ref={menuRef} className="relative">
                <summary
                    aria-label={`More actions for ${job.title}`}
                    className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] [&::-webkit-details-marker]:hidden"
                >
                    <FiMoreHorizontal aria-hidden="true" />
                </summary>
                <div className="absolute right-0 z-30 mt-2 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                    {job.status === 'Open' ? (
                        <button
                            type="button"
                            onClick={() => choose('close')}
                            className="w-full rounded px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Close vacancy
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => choose('publish')}
                            className="w-full rounded px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Publish vacancy
                        </button>
                    )}
                    {canArchive ? (
                        <button
                            type="button"
                            onClick={() => choose('archive')}
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                            <FiArchive aria-hidden="true" />
                            Archive job
                        </button>
                    ) : null}
                </div>
            </details>
        </div>
    )
}

const JobsPageTable = () => {
    const { data: user } = useUser()
    const canReviewApplications = hasStaffPermission(user?.role, 'applications:review')
    const canArchive = hasStaffPermission(user?.role, 'jobs:archive')
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const queryString = searchParams.toString()
    const rawView = searchParams.get('view')
    const rawSort = searchParams.get('sort')
    const view: AdminJobView = rawView && ADMIN_JOB_VIEWS.includes(rawView as AdminJobView)
        ? rawView as AdminJobView
        : 'all'
    const sort: AdminJobSort = rawSort && ADMIN_JOB_SORTS.includes(rawSort as AdminJobSort)
        ? rawSort as AdminJobSort
        : 'newest'
    const page = numberParam(searchParams.get('page'))
    const urlSearch = searchParams.get('search') ?? ''
    const [searchValue, setSearchValue] = useState(urlSearch)
    const [confirmation, setConfirmation] = useState<Confirmation>(null)

    const updateParams = useCallback((
        updates: Record<string, string | undefined>,
        resetPage = true,
    ) => {
        const params = new URLSearchParams(queryString)
        for (const [key, value] of Object.entries(updates)) {
            if (value) params.set(key, value)
            else params.delete(key)
        }
        if (resetPage) params.delete('page')
        const next = params.toString()
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }, [pathname, queryString, router])

    useEffect(() => {
        setSearchValue(urlSearch)
    }, [urlSearch])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const nextSearch = searchValue.trim()
            if (
                nextSearch !== urlSearch
                && (!nextSearch || nextSearch.length >= 3)
            ) {
                updateParams({ search: nextSearch || undefined })
            }
        }, 350)
        return () => window.clearTimeout(timer)
    }, [searchValue, updateParams, urlSearch])

    const jobsQuery = useAdminVacancies({
        page,
        limit: 20,
        search: urlSearch || undefined,
        view,
        sort,
    })
    const archiveJob = useDeleteAdminJob()
    const restoreJob = useRestoreAdminJob()
    const updateStatus = useUpdateAdminJobStatus()
    const rows = jobsQuery.data?.data ?? []
    const summary = jobsQuery.data?.summary ?? emptySummary
    const mutationPending = archiveJob.isPending
        || restoreJob.isPending
        || updateStatus.isPending

    useEffect(() => {
        const totalPages = jobsQuery.data?.pagination.totalPages
        if (totalPages !== undefined && totalPages > 0 && page > totalPages) {
            updateParams({ page: String(totalPages) }, false)
        }
    }, [jobsQuery.data?.pagination.totalPages, page, updateParams])

    const performConfirmedAction = async () => {
        if (!confirmation) return
        const { job, type } = confirmation
        try {
            if (type === 'archive') {
                await archiveJob.mutateAsync(job._id)
                toast.success('Job archived')
            } else if (type === 'restore') {
                await restoreJob.mutateAsync(job._id)
                toast.success('Job restored as closed')
            } else {
                const status = type === 'publish' ? 'Open' : 'Closed'
                await updateStatus.mutateAsync({ jobId: job._id, status })
                toast.success(type === 'publish' ? 'Vacancy published' : 'Vacancy closed')
            }
            setConfirmation(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update job')
        }
    }

    const modalCopy = confirmation
        ? {
            publish: {
                title: 'Publish vacancy?',
                body: <p><strong>{confirmation.job.title}</strong> will become public and begin accepting applications.</p>,
                action: updateStatus.isPending ? 'Publishing…' : 'Publish vacancy',
            },
            close: {
                title: 'Close vacancy?',
                body: <p><strong>{confirmation.job.title}</strong> will leave public listings and stop accepting new applications. Existing applications remain available.</p>,
                action: updateStatus.isPending ? 'Closing…' : 'Close vacancy',
            },
            restore: {
                title: 'Restore archived job?',
                body: <p><strong>{confirmation.job.title}</strong> will return to admin as Closed. It will remain hidden from candidates until you publish it.</p>,
                action: restoreJob.isPending ? 'Restoring…' : 'Restore as closed',
            },
            archive: {
                title: 'Archive job?',
                body: (
                    <div className="space-y-4">
                        <p>Archive <strong>{confirmation.job.title}</strong>?</p>
                        <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
                            <p className="text-xs font-medium text-white/70">Applications preserved</p>
                            <p className="mt-1 text-2xl font-semibold">
                                {(confirmation.job.totalApplicants ?? 0).toLocaleString()}
                            </p>
                        </div>
                        <p className="text-sm leading-6 text-white/75">
                            The job will be hidden from normal admin and public listings. You can restore it later.
                        </p>
                    </div>
                ),
                action: archiveJob.isPending ? 'Archiving…' : 'Archive job',
            },
        }[confirmation.type]
        : null

    return (
        <div className="space-y-4">
            <section aria-label="Job directory controls" className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <FiSearch
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <label htmlFor="admin-job-search" className="sr-only">Search jobs</label>
                        <input
                            id="admin-job-search"
                            type="search"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search title, company or location…"
                            className="min-h-11 w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-[#184aa2] focus:ring-2 focus:ring-[#184aa2]/20"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Sort by</span>
                        <select
                            value={sort}
                            onChange={(event) => updateParams({
                                sort: event.target.value === 'newest'
                                    ? undefined
                                    : event.target.value,
                            })}
                            className="min-h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[#184aa2] focus:ring-2 focus:ring-[#184aa2]/20"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="deadline">Deadline soonest</option>
                            <option value="applicants">Most applicants</option>
                        </select>
                    </label>
                </div>
                {searchValue.trim().length > 0 && searchValue.trim().length < 3 ? (
                    <p className="mt-2 text-xs text-gray-500">Enter at least 3 characters to search.</p>
                ) : null}

                <nav aria-label="Job status views" className="mt-4 overflow-x-auto border-t border-gray-100 pt-4">
                    <div className="flex min-w-max gap-2">
                        {viewTabs.map((tab) => {
                            const selected = view === tab.value
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => updateParams({
                                        view: tab.value === 'all' ? undefined : tab.value,
                                    })}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] ${
                                        selected
                                            ? 'bg-[#184aa2] text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                                        selected ? 'bg-white/20' : 'bg-white text-gray-500'
                                    }`}>
                                        {summary[tab.count].toLocaleString()}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </nav>
            </section>

            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600" aria-live="polite">
                    {jobsQuery.isLoading
                        ? 'Loading jobs…'
                        : `${(jobsQuery.data?.pagination.total ?? 0).toLocaleString()} ${
                            jobsQuery.data?.pagination.total === 1 ? 'job' : 'jobs'
                        }`}
                </p>
                {urlSearch ? (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchValue('')
                            updateParams({ search: undefined })
                        }}
                        className="text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                    >
                        Clear search
                    </button>
                ) : null}
            </div>

            {jobsQuery.isLoading ? (
                <div role="status" className="space-y-3" aria-label="Loading jobs">
                    {[0, 1, 2].map((item) => (
                        <div key={item} className="h-20 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
                    ))}
                </div>
            ) : null}

            {jobsQuery.isError ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
                    <p className="font-semibold">Unable to load jobs</p>
                    <p className="mt-1 text-sm">{jobsQuery.error.message}</p>
                    <button
                        type="button"
                        onClick={() => void jobsQuery.refetch()}
                        className="mt-3 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold hover:bg-red-100"
                    >
                        Try again
                    </button>
                </div>
            ) : null}

            {!jobsQuery.isLoading && !jobsQuery.isError && rows.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                    <p className="font-semibold text-gray-900">No jobs found</p>
                    <p className="mt-1 text-sm text-gray-500">
                        {urlSearch ? 'Try another search or status view.' : 'There are no jobs in this view yet.'}
                    </p>
                </div>
            ) : null}

            {!jobsQuery.isLoading && !jobsQuery.isError && rows.length > 0 ? (
                <>
                    <div className="hidden overflow-visible rounded-xl border border-gray-200 bg-white lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[940px] text-left">
                                <caption className="sr-only">Admin job directory</caption>
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        {['Job', 'Status', 'Deadline', 'Applicants', 'Posted', 'Actions'].map((heading) => (
                                            <th key={heading} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rows.map((job) => (
                                        <tr
                                            key={job._id}
                                            onClick={(event) => {
                                                const target = event.target as HTMLElement
                                                if (target.closest('a, button, input, select, textarea, summary, details')) return
                                                router.push(`/admin-center/jobs/${job._id}`)
                                            }}
                                            className="cursor-pointer transition-colors hover:bg-blue-50/40"
                                        >
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/admin-center/jobs/${job._id}`}
                                                    className="font-semibold text-gray-950 hover:text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                                                >
                                                    {job.title}
                                                </Link>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {job.company.name} · {job.location}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4"><JobStatus job={job} /></td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {job.deadline ? formatJobDeadline(job.deadline) : 'No deadline'}
                                            </td>
                                            <td className="px-4 py-4">
                                                {canReviewApplications ? (
                                                    <Link
                                                        href={`/admin-center/applications?jobId=${encodeURIComponent(job._id)}`}
                                                        className="font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                                                    >
                                                        {(job.totalApplicants ?? 0).toLocaleString()}
                                                        <span className="sr-only"> applications for {job.title}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="font-semibold text-gray-800">{(job.totalApplicants ?? 0).toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{formatDate(job.createdAt)}</td>
                                            <td className="px-4 py-4">
                                                <JobActions job={job} canArchive={canArchive} onAction={(type, selectedJob) => setConfirmation({ type, job: selectedJob })} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls
                            pagination={jobsQuery.data?.pagination}
                            onPageChange={(nextPage) => updateParams({ page: String(nextPage) }, false)}
                        />
                    </div>

                    <div className="grid gap-3 lg:hidden">
                        {rows.map((job) => (
                            <article key={job._id} className="rounded-xl border border-gray-200 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/admin-center/jobs/${job._id}`}
                                            className="font-semibold text-gray-950 hover:text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                                        >
                                            {job.title}
                                        </Link>
                                        <p className="mt-1 break-words text-sm text-gray-600">
                                            {job.company.name} · {job.location}
                                        </p>
                                    </div>
                                    <JobStatus job={job} />
                                </div>
                                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <dt className="text-gray-500">Deadline</dt>
                                        <dd className="mt-0.5 font-medium text-gray-900">
                                            {job.deadline ? formatJobDeadline(job.deadline) : 'No deadline'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Applications</dt>
                                        <dd className="mt-0.5">
                                            {canReviewApplications ? (
                                                <Link
                                                    href={`/admin-center/applications?jobId=${encodeURIComponent(job._id)}`}
                                                    className="font-semibold text-[#184aa2] hover:underline"
                                                >
                                                    {(job.totalApplicants ?? 0).toLocaleString()}
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-gray-800">{(job.totalApplicants ?? 0).toLocaleString()}</span>
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">{job.archivedAt ? 'Archived' : 'Posted'}</dt>
                                        <dd className="mt-0.5 font-medium text-gray-900">
                                            {formatDate(job.archivedAt || job.createdAt)}
                                        </dd>
                                    </div>
                                </dl>
                                <div className="mt-4 flex justify-end">
                                    <JobActions job={job} canArchive={canArchive} onAction={(type, selectedJob) => setConfirmation({ type, job: selectedJob })} />
                                </div>
                            </article>
                        ))}
                        <div className="rounded-xl border border-gray-200 bg-white">
                            <PaginationControls
                                pagination={jobsQuery.data?.pagination}
                                onPageChange={(nextPage) => updateParams({ page: String(nextPage) }, false)}
                            />
                        </div>
                    </div>
                </>
            ) : null}

            <Modal
                isOpen={Boolean(confirmation)}
                title={modalCopy?.title}
                body={modalCopy?.body}
                actionLabel={modalCopy?.action || 'Continue'}
                actionTone={confirmation?.type === 'archive' ? 'danger' : 'default'}
                disabled={mutationPending}
                size="compact"
                onClose={() => setConfirmation(null)}
                onSubmit={() => void performConfirmedAction()}
                footer={(
                    <button
                        type="button"
                        disabled={mutationPending}
                        onClick={() => setConfirmation(null)}
                        className="w-full rounded-md border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
                    >
                        {confirmation?.type === 'archive' ? 'No, keep job' : 'Cancel'}
                    </button>
                )}
            />
        </div>
    )
}

export default JobsPageTable
