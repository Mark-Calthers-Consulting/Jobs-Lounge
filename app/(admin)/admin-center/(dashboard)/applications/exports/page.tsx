import { Suspense } from 'react'
import ApplicationExportRequests from '@/components/applications/ApplicationExportRequests'

export default function ApplicationExportsPage() {
  return (
    <Suspense fallback={<p role="status">Loading export requests…</p>}>
      <ApplicationExportRequests />
    </Suspense>
  )
}
