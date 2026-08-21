'use client'

import { APPLICATION_STATUSES, type ApplicationStatus } from '@/constants/enums'
import {
    useAdminJob,
    useDeleteAdminJob,
    useRestoreAdminJob,
    useUpdateAdminJobStatus,
} from '@/hooks/useAdmin'
import { useUser } from '@/hooks/useUsers'
import JobDetailContent from '@/components/JobDetailContent'
import Modal from '@/components/Modal'
import type { Job } from '@/types/types'
import { formatJobDeadline } from '@/utils/jobDeadline'
import { hasStaffPermission } from '@/utils/staffPermissions'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { formatDateInTimeZone } from '@/utils/dateTime'
import Link from 'next/link'
import { useState } from 'react'
import {
    FiArchive,
    FiArrowLeft,
    FiEdit3,
    FiExternalLink,
    FiMoreHorizontal,
    FiRefreshCw,
} from 'react-icons/fi'
import { toast } from 'sonner'

type Confirmation = 'publish' | 'close' | 'archive' | 'restore' | null

const statusStyle: Record<Job['status'], string> = {
    Draft: 'bg-amber-50 text-amber-800 ring-amber-200',
    Open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Closed: 'bg-gray-100 text-gray-700 ring-gray-200',
}

const statusLabels: Record<ApplicationStatus, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    shortlisted: 'Shortlisted',
    rejected: 'Rejected',
}

const AdminJobPreview = ({ jobId }: { jobId: string }) => {
    const { timeZone } = usePlatformSettings()
    const { data: user } = useUser()
    const canReviewApplications = hasStaffPermission(user?.role, 'applications:review')
    const canArchive = hasStaffPermission(user?.role, 'jobs:archive')
    const { data: job, isLoading, isError, error } = useAdminJob(jobId)
    const updateStatus = useUpdateAdminJobStatus()
    const archiveJob = useDeleteAdminJob()
    const restoreJob = useRestoreAdminJob()
    const [confirmation, setConfirmation] = useState<Confirmation>(null)

    if (isLoading) return <p role="status">Loading job preview…</p>
    if (isError || !job) {
        return (
            <div>
                <p role="alert" className="text-red-700">
                    {error instanceof Error ? error.message : 'Unable to load job preview.'}
                </p>
                <Link href="/admin-center/jobs" className="mt-4 inline-block font-semibold text-[#184aa2] underline">
                    Return to jobs
                </Link>
            </div>
        )
    }

    const archived = Boolean(job.archivedAt)
    const applicationSummary = job.applicationSummary || {
        total: job.totalApplicants ?? 0,
        byStatus: {
            pending: 0,
            reviewed: 0,
            shortlisted: 0,
            rejected: 0,
        },
    }
    const applicationsUrl = (status?: ApplicationStatus) => {
        const params = new URLSearchParams({ jobId: job._id })
        if (status) params.set('status', status)
        return `/admin-center/applications?${params}`
    }

    const changeStatus = async (status: Job['status']) => {
        try {
            await updateStatus.mutateAsync({ jobId: job._id, status })
            toast.success(status === 'Open' ? 'Vacancy published' : 'Vacancy closed')
            setConfirmation(null)
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : 'Unable to update vacancy')
        }
    }

    const confirmArchive = async () => {
        try {
            await archiveJob.mutateAsync(job._id)
            toast.success('Job archived')
            setConfirmation(null)
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : 'Unable to archive job')
        }
    }

    const confirmRestore = async () => {
        try {
            await restoreJob.mutateAsync(job._id)
            toast.success('Job restored as closed')
            setConfirmation(null)
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : 'Unable to restore job')
        }
    }

    const dialogPending = updateStatus.isPending || archiveJob.isPending || restoreJob.isPending
    const canViewPublicly = !archived && job.status === 'Open'
    const confirmedStatus: Job['status'] = confirmation === 'close' ? 'Closed' : 'Open'

    return (
        <div className="pb-10">
            <section
                aria-labelledby="admin-preview-title"
                className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
            >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <Link
                            href={archived ? '/admin-center/jobs?view=archived' : '/admin-center/jobs'}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline"
                        >
                            <FiArrowLeft aria-hidden="true" />
                            Back to jobs
                        </Link>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <h1 id="admin-preview-title" className="text-lg font-semibold text-gray-950">
                                Admin preview
                            </h1>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                                archived
                                    ? 'bg-slate-100 text-slate-700 ring-slate-200'
                                    : statusStyle[job.status]
                            }`}>
                                {archived ? 'Archived' : job.status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            {archived
                                ? 'This job is hidden from public and normal admin listings. Restore it before editing or publishing.'
                                : 'Review the candidate-facing job content before editing or changing its visibility.'}
                        </p>
                        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                            <div className="flex gap-1.5">
                                <dt className="text-gray-500">Applications:</dt>
                                <dd>
                                    {canReviewApplications ? (
                                        <Link href={applicationsUrl()} className="font-semibold text-[#184aa2] hover:underline">
                                            {applicationSummary.total.toLocaleString()}
                                        </Link>
                                    ) : (
                                        <span className="font-semibold text-gray-800">{applicationSummary.total.toLocaleString()}</span>
                                    )}
                                </dd>
                            </div>
                            <div className="flex gap-1.5">
                                <dt className="text-gray-500">Updated:</dt>
                                <dd className="font-medium text-gray-800">
                                    {formatDateInTimeZone(job.updatedAt, timeZone)}
                                </dd>
                            </div>
                            <div className="flex gap-1.5">
                                <dt className="text-gray-500">Uploaded by:</dt>
                                <dd className="font-medium text-gray-800">
                                    {job.postedBy?.name || 'Not recorded'}
                                </dd>
                            </div>
                            {job.lastEditedBy ? (
                                <div className="flex gap-1.5">
                                    <dt className="text-gray-500">Last edited by:</dt>
                                    <dd className="font-medium text-gray-800">
                                        {job.lastEditedBy.name} on{' '}
                                        {formatDateInTimeZone(job.lastEditedBy.at, timeZone, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </dd>
                                </div>
                            ) : null}
                            {archived && job.archivedAt ? (
                                <div className="flex gap-1.5">
                                    <dt className="text-gray-500">Archived:</dt>
                                    <dd className="font-medium text-gray-800">
                                        {formatDateInTimeZone(job.archivedAt, timeZone)}
                                    </dd>
                                </div>
                            ) : (
                                <div className="flex gap-1.5">
                                    <dt className="text-gray-500">Deadline:</dt>
                                    <dd className="font-medium text-gray-800">
                                        {job.deadline ? formatJobDeadline(job.deadline, timeZone) : 'No deadline'}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {archived ? (
                            canArchive ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmation('restore')}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#184aa2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123d87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                                >
                                    <FiRefreshCw aria-hidden="true" />
                                    Restore as closed
                                </button>
                            ) : null
                        ) : (
                            <>
                                <Link
                                    href={`/admin-center/jobs/${job._id}/edit`}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#184aa2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123d87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                                >
                                    <FiEdit3 aria-hidden="true" />
                                    Edit job
                                </Link>
                                {canViewPublicly ? (
                                    <Link
                                        href={`/vacancies/${job._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        View public listing
                                        <FiExternalLink aria-hidden="true" />
                                        <span className="sr-only">(opens in a new tab)</span>
                                    </Link>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => setConfirmation(canViewPublicly ? 'close' : 'publish')}
                                    className="min-h-10 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    {canViewPublicly ? 'Close vacancy' : 'Publish vacancy'}
                                </button>
                                {canArchive ? <details className="relative">
                                    <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] [&::-webkit-details-marker]:hidden">
                                        <FiMoreHorizontal aria-hidden="true" />
                                        <span className="sr-only">More actions</span>
                                    </summary>
                                    <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmation('archive')}
                                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                                        >
                                            <FiArchive aria-hidden="true" />
                                            Archive job
                                        </button>
                                    </div>
                                </details> : null}
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section aria-labelledby="application-summary-title" className="mt-5">
                <h2 id="application-summary-title" className="sr-only">Application summary</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {canReviewApplications ? <Link
                        href={applicationsUrl()}
                        className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                    >
                        <span className="text-sm text-gray-500">All applications</span>
                        <span className="mt-2 block text-2xl font-bold text-gray-950">{applicationSummary.total}</span>
                    </Link> : (
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <span className="text-sm text-gray-500">Total applications</span>
                            <span className="mt-2 block text-2xl font-bold text-gray-950">{applicationSummary.total}</span>
                        </div>
                    )}
                    {canReviewApplications && applicationSummary.byStatus ? APPLICATION_STATUSES.map((status) => (
                        <Link
                            key={status}
                            href={applicationsUrl(status)}
                            className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                        >
                            <span className="text-sm text-gray-500">{statusLabels[status]}</span>
                            <span className="mt-2 block text-2xl font-bold text-gray-950">
                                {applicationSummary.byStatus?.[status] ?? 0}
                            </span>
                        </Link>
                    )) : null}
                </div>
            </section>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white pb-8">
                <div className="border-b border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Candidate-facing content preview
                </div>
                <JobDetailContent job={job} />
            </div>

            <Modal
                isOpen={confirmation === 'publish' || confirmation === 'close'}
                title={confirmedStatus === 'Open' ? 'Publish vacancy?' : 'Close vacancy?'}
                body={confirmedStatus === 'Open'
                    ? <p><strong>{job.title}</strong> will become visible publicly and begin accepting applications.</p>
                    : <p><strong>{job.title}</strong> will disappear from public listings and stop accepting new applications.</p>}
                actionLabel={updateStatus.isPending
                    ? (confirmedStatus === 'Open' ? 'Publishing…' : 'Closing…')
                    : (confirmedStatus === 'Open' ? 'Publish vacancy' : 'Close vacancy')}
                disabled={dialogPending}
                size="compact"
                onClose={() => setConfirmation(null)}
                onSubmit={() => void changeStatus(confirmedStatus)}
            />

            <Modal
                isOpen={confirmation === 'archive'}
                title="Archive job?"
                body={(
                    <div className="space-y-4">
                        <p>Archive <strong>{job.title}</strong>?</p>
                        <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
                            <p className="text-xs font-medium text-white/70">Applications preserved</p>
                            <p className="mt-1 text-2xl font-semibold">
                                {applicationSummary.total.toLocaleString()}
                            </p>
                        </div>
                        <p className="text-sm leading-6 text-white/75">
                            The job will leave public and normal admin listings, but can be restored later.
                        </p>
                    </div>
                )}
                actionLabel={archiveJob.isPending ? 'Archiving…' : 'Archive job'}
                actionTone="danger"
                disabled={dialogPending}
                size="compact"
                onClose={() => setConfirmation(null)}
                onSubmit={() => void confirmArchive()}
                footer={(
                    <button
                        type="button"
                        disabled={dialogPending}
                        onClick={() => setConfirmation(null)}
                        className="w-full rounded-md border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
                    >
                        No, keep job
                    </button>
                )}
            />

            <Modal
                isOpen={confirmation === 'restore'}
                title="Restore archived job?"
                body={<p><strong>{job.title}</strong> will return as Closed and remain hidden until you publish it.</p>}
                actionLabel={restoreJob.isPending ? 'Restoring…' : 'Restore as closed'}
                disabled={dialogPending}
                size="compact"
                onClose={() => setConfirmation(null)}
                onSubmit={() => void confirmRestore()}
            />
        </div>
    )
}

export default AdminJobPreview
