'use client'

import CreateJobForm from '@/components/CreateJobForm'
import { useAdminJob } from '@/hooks/useAdmin'
import { useParams } from 'next/navigation'

const EditJobPage = () => {
    const params = useParams<{ jobId: string }>()
    const { data: job, isLoading, isError, error } = useAdminJob(params.jobId)

    if (isLoading) return <p role="status">Loading job…</p>
    if (isError || !job) return <p role="alert" className="text-red-700">{error instanceof Error ? error.message : 'Unable to load job.'}</p>

    return <CreateJobForm initialJob={job} />
}

export default EditJobPage
