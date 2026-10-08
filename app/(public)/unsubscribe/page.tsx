import UnsubscribeClient from './UnsubscribeClient'
export const metadata = { title: 'Email preferences | Jobs Lounge', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <UnsubscribeClient token={token || ''} />
}
