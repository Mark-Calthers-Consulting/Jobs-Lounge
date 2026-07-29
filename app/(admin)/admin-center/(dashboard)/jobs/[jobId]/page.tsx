'use client'

import { useParams } from 'next/navigation'

import AdminJobPreview from './AdminJobPreview'

const AdminJobPreviewPage = () => {
    const params = useParams<{ jobId: string }>()
    return <AdminJobPreview jobId={params.jobId} />
}

export default AdminJobPreviewPage
