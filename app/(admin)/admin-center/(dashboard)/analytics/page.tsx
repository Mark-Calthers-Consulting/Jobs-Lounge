import ApplicationAnalyticsSummary from '@/components/applications/ApplicationAnalyticsSummary'

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-950 text-balance">Analytics</h1>
      <p className="mt-2 max-w-2xl text-pretty text-slate-600">
        Monitor application activity and the health of candidate communications.
      </p>
      <div className="mt-8">
        <ApplicationAnalyticsSummary />
      </div>
    </div>
  )
}
