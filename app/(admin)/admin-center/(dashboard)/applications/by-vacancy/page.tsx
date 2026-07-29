import ApplicationJobDirectory from '@/components/applications/ApplicationJobDirectory'
import { Suspense } from 'react'

export default function ApplicationsByVacancyPage() {
  return (
    <Suspense fallback={<p role="status">Loading vacancy workloads…</p>}>
      <ApplicationJobDirectory />
    </Suspense>
  )
}
