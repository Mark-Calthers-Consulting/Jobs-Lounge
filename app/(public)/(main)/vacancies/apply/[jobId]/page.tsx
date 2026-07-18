import type { Job, JobPageProps } from '../../../../../../types/types'
import { notFound } from 'next/navigation'
import { serverApiUrl } from '@/api/serverBase'

const getSingleJob = async (id: string): Promise<Job> => {
    const res = await fetch(
        serverApiUrl(`/jobs/${encodeURIComponent(id)}`),
        { cache: 'no-store' }
    )

    if (res.status === 404) {
        notFound()
    }

    if (!res.ok) {
        throw new Error('Failed to fetch job')
    }

    const data = await res.json()
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
