import type { ApiSuccess, Job, JobPageProps } from '../../../../../../types/types'
import { notFound } from 'next/navigation'
import { serverApiUrl } from '@/api/serverBase'
import { readApiResponse } from '@/api/errors'

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
        <div>
            <h1>Application for {job.title} </h1>
        </div>
    )
}

export default ApplicationPage
