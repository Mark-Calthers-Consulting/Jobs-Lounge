import VacancyApplicationWorkspace from '@/components/applications/VacancyApplicationWorkspace'
import { Suspense } from 'react'

export default async function VacancyApplicationWorkspacePage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  return (
    <Suspense fallback={<p role="status">Loading vacancy workspace…</p>}>
      <VacancyApplicationWorkspace jobId={jobId} />
    </Suspense>
  )
}
