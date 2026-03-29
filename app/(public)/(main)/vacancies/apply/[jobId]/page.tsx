import type { Job, JobPageProps } from '../../../../../../types/types'

const getSingleJob = async (id: string): Promise<Job> => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${id}`,
        { cache: 'no-store' }
    )

    if (!res.ok) {
        throw new Error('Failed to fetch job')
    }

    const data = await res.json()
    console.log(data)
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
