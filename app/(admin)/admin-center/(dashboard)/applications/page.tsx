import ApplicationsOverview from '@/components/applications/ApplicationsOverview'
import { redirect } from 'next/navigation'

const AdminApplications = async ({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
    const query = await searchParams
    const jobId = typeof query.jobId === 'string' ? query.jobId : undefined
    const status = typeof query.status === 'string' ? query.status : undefined
    if (jobId) {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        redirect(`/admin-center/applications/jobs/${encodeURIComponent(jobId)}${params.size ? `?${params}` : ''}`)
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-950">Applications</h1>
            <p className="mb-6 mt-2 text-slate-600">Review workloads, triage new submissions and move candidates through your private hiring stages.</p>
            <ApplicationsOverview />
        </div>
    )
}

export default AdminApplications
