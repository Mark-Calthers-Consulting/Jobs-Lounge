'use client'

import CreateJobForm from '@/components/CreateJobForm'
import { useAdminJob } from '@/hooks/useAdmin'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const EditJobPage = () => {
    const params = useParams<{ jobId: string }>()
    const { data: job, isLoading, isError, error } = useAdminJob(params.jobId)

    if (isLoading) return <p role="status">Loading job…</p>
    if (isError || !job) return <p role="alert" className="text-red-700">{error instanceof Error ? error.message : 'Unable to load job.'}</p>
    if (job.archivedAt) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h1 className="font-semibold text-amber-950">Restore this job before editing</h1>
                <p className="mt-1 text-sm text-amber-900">
                    Archived jobs remain read-only until they are restored as Closed.
                </p>
                <Link
                    href={`/admin-center/jobs/${job._id}`}
                    className="mt-4 inline-flex rounded-md bg-[#184aa2] px-4 py-2 text-sm font-semibold text-white"
                >
                    Return to job preview
                </Link>
            </div>
        )
    }

    return <CreateJobForm initialJob={job} />
}

export default EditJobPage
