import CandidateJobActivity from '@/components/CandidateJobActivity'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CandidateJobsPage({ searchParams }: PageProps) {
  const query = await searchParams
  const view = query.view === 'applications' ? 'applications' : 'saved'
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page
  const parsedPage = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1

  return <CandidateJobActivity view={view} page={page} />
}
