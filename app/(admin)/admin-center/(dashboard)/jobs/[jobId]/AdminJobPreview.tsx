'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiArrowLeft, FiEdit3, FiExternalLink, FiMoreHorizontal } from 'react-icons/fi'
import { toast } from 'sonner'

import JobDetailContent from '@/components/JobDetailContent'
import Modal from '@/components/Modal'
import type { Job } from '@/types/types'
import { formatJobDeadline } from '@/utils/jobDeadline'
import {
    useAdminJob,
    useDeleteAdminJob,
    useUpdateAdminJobStatus,
} from '@/hooks/useAdmin'

type Confirmation = 'publish' | 'close' | 'delete' | null

const statusStyle: Record<Job['status'], string> = {
    Draft: 'bg-amber-50 text-amber-800 ring-amber-200',
    Open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Closed: 'bg-gray-100 text-gray-700 ring-gray-200',
}

const AdminJobPreview = ({ jobId }: { jobId: string }) => {
    const router = useRouter()
    const { data: job, isLoading, isError, error } = useAdminJob(jobId)
    const updateStatus = useUpdateAdminJobStatus()
    const deleteJob = useDeleteAdminJob()
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

    const changeStatus = async (status: Job['status']) => {
        try {
            await updateStatus.mutateAsync({ jobId: job._id, status })
            toast.success(status === 'Open' ? 'Vacancy published' : 'Vacancy closed')
            setConfirmation(null)
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : 'Unable to update vacancy')
        }
    }

    const confirmDelete = async () => {
        try {
            await deleteJob.mutateAsync(job._id)
            toast.success('Job removed from admin listings')
            router.replace('/admin-center/jobs')
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : 'Unable to delete job')
        }
    }

    const dialogPending = updateStatus.isPending || deleteJob.isPending
    const canViewPublicly = job.status === 'Open'
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
                            href="/admin-center/jobs"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline"
                        >
                            <FiArrowLeft aria-hidden="true" />
                            Back to jobs
                        </Link>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <h1 id="admin-preview-title" className="text-lg font-semibold text-gray-950">
                                Admin preview
                            </h1>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[job.status]}`}>
                                {job.status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            Review the candidate-facing job content before editing or changing its visibility.
                        </p>
                        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                            <div className="flex gap-1.5">
                                <dt className="text-gray-500">Applicants:</dt>
                                <dd className="font-semibold text-gray-900">
                                    {(job.totalApplicants ?? 0).toLocaleString()}
                                </dd>
                            </div>
                            <div className="flex gap-1.5">
                                <dt className="text-gray-500">Updated:</dt>
                                <dd className="font-medium text-gray-800">
                                    {new Date(job.updatedAt).toLocaleDateString('en-NG')}
                                </dd>
                            </div>
                            <div className="flex gap-1.5">
                                <dt className="text-gray-500">Deadline:</dt>
                                <dd className="font-medium text-gray-800">
                                    {job.deadline ? formatJobDeadline(job.deadline) : 'No deadline'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                        <details className="relative">
                            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                                <FiMoreHorizontal aria-hidden="true" />
                                <span className="sr-only">More actions</span>
                            </summary>
                            <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                                <button
                                    type="button"
                                    onClick={() => setConfirmation('delete')}
                                    className="w-full rounded px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                                >
                                    Delete job
                                </button>
                            </div>
                        </details>
                    </div>
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
                isOpen={confirmation === 'delete'}
                title="Delete job?"
                body={(
                    <div className="space-y-4">
                        <p>Are you sure you want to delete <strong>{job.title}</strong>?</p>
                        <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
                            <p className="text-xs font-medium text-white/70">Applicants for this job</p>
                            <p className="mt-1 text-2xl font-semibold">
                                {(job.totalApplicants ?? 0).toLocaleString()}
                            </p>
                        </div>
                        <p className="text-sm leading-6 text-white/75">
                            Deleting removes the job from admin and public listings. Existing application history is preserved.
                        </p>
                    </div>
                )}
                actionLabel={deleteJob.isPending ? 'Deleting…' : 'Yes, delete job'}
                actionTone="danger"
                disabled={dialogPending}
                size="compact"
                onClose={() => setConfirmation(null)}
                onSubmit={() => void confirmDelete()}
                footer={(
                    <>
                        {job.status === 'Open' ? (
                            <button
                                type="button"
                                disabled={dialogPending}
                                onClick={() => void changeStatus('Closed')}
                                className="w-full rounded-md border border-blue-300/60 px-4 py-2.5 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/15 disabled:cursor-wait disabled:opacity-60"
                            >
                                {updateStatus.isPending ? 'Closing…' : 'Close vacancy instead'}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            disabled={dialogPending}
                            onClick={() => setConfirmation(null)}
                            className="w-full rounded-md border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
                        >
                            No, keep job
                        </button>
                    </>
                )}
            />
        </div>
    )
}

export default AdminJobPreview
