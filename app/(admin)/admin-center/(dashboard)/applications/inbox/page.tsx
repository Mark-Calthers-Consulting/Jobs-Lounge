import ApplicationsInbox from '@/components/applications/ApplicationsInbox'
import { Suspense } from 'react'

export default function ApplicationsInboxPage() {
  return (
    <Suspense fallback={<p role="status">Loading application inbox…</p>}>
      <ApplicationsInbox />
    </Suspense>
  )
}
