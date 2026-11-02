import AnalyticsPageClient from '@/components/applications/AnalyticsPageClient'

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-950 text-balance">Analytics</h1>
      <p className="mt-2 max-w-2xl text-pretty text-slate-600">
        Monitor application activity and the health of candidate communications.
      </p>
      <div className="mt-8">
        <AnalyticsPageClient initialTab={tab === 'emails' ? 'Emails' : 'Applications'} />
      </div>
    </div>
  )
}
