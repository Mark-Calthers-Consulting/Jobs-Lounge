import type { ApiSuccess, Job, JobPageProps } from '../../../../../../types/types'
import { notFound } from 'next/navigation'
import { serverApiUrl } from '@/api/serverBase'
import { readApiResponse } from '@/api/errors'
import ApplicationForm from './ApplicationForm'

const getSingleJob = async (id: string): Promise<Job> => {
    const res = await fetch(
        serverApiUrl(`/jobs/${encodeURIComponent(id)}`),
        { cache: 'no-store' }
    )

    if (res.status === 404) {
        notFound()
    }

    const data = await readApiResponse<ApiSuccess<Job>>(res, 'Failed to fetch job')
    return data.data
}

const ApplicationPage = async ({ params }: JobPageProps) => {
    const { jobId } = await params
    const job = await getSingleJob(jobId)
    return (
        <div className="mx-auto max-w-3xl px-6 py-12">
            <h1 className="mb-2 text-3xl font-bold">Application for {job.title}</h1>
            <p className="mb-8 text-gray-600">Review your application details before submitting.</p>
            <ApplicationForm jobId={jobId} jobTitle={job.title} />
        </div>
    )
}

export default ApplicationPage
