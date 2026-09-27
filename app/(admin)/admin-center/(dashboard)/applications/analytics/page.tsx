import ApplicationAnalyticsSummary from '@/components/applications/ApplicationAnalyticsSummary'
import ApplicationWorkspaceNav from '@/components/applications/ApplicationWorkspaceNav'

export default function ApplicationAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-950">Applications</h1>
      <p className="mt-2 text-slate-600">Review application volume and the health of candidate communications.</p>
      <div className="mt-6">
        <ApplicationWorkspaceNav />
      </div>
      <div className="mt-6">
        <ApplicationAnalyticsSummary />
      </div>
    </div>
  )
}
