import EmailCenterPageClient from './EmailCenterPageClient'

export default async function TeamEmailsPage({ searchParams }: { searchParams: Promise<{ request?: string }> }) {
  const { request } = await searchParams
  return <EmailCenterPageClient initialRequestId={typeof request === 'string' ? request : undefined} />
}
