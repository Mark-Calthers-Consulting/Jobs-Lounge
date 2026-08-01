'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiArrowRight, FiBookmark, FiBriefcase, FiFileText, FiMapPin } from 'react-icons/fi'
import { toast } from 'sonner'

import PaginationControls from '@/components/PaginationControls'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { useGetMyApplications } from '@/hooks/useApplications'
import { useGetSavedJobs } from '@/hooks/useUsers'
import { useUnsaveJob } from '@/hooks/useVacancies'
import type { Job, JobApplication } from '@/types/types'
import { formatDateInTimeZone } from '@/utils/dateTime'

type CandidateJobActivityProps = {
  view: 'saved' | 'applications'
  page: number
}

const PAGE_SIZE = 12

const safeDocumentLink = (value?: string) => {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined
  } catch {
    return undefined
  }
}

const LoadingCards = () => (
  <div role="status" aria-label="Loading job activity" className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="h-44 animate-pulse rounded-lg border border-slate-200 bg-white" />
    ))}
    <span className="sr-only">Loading…</span>
  </div>
)

const SavedVacancyCard = ({ job }: { job: Job }) => {
  const unsave = useUnsaveJob()

  return (
    <article className="flex min-h-52 flex-col border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{job.company?.name || 'Company not specified'}</p>
          <h2 className="mt-1 text-lg font-semibold leading-6 text-slate-950">{job.title}</h2>
        </div>
        <button
          type="button"
          disabled={unsave.isPending}
          onClick={() => unsave.mutate(job._id, {
            onSuccess: () => toast.success('Removed from saved jobs'),
            onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to remove saved job'),
          })}
          aria-label={`Remove ${job.title} from saved jobs`}
          className="grid size-9 shrink-0 place-items-center rounded-md text-[#184aa2] hover:bg-blue-50 disabled:cursor-wait disabled:opacity-50"
        >
          <FiBookmark aria-hidden="true" className="fill-current" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5"><FiMapPin aria-hidden="true" />{job.location}</span>
        <span>{job.workMode}</span>
        <span>{job.jobType}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
        <span className="text-xs text-slate-500">Saved for later</span>
        <Link
          href={`/vacancies/${job._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
        >
          View vacancy <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

const ApplicationCard = ({ application }: { application: JobApplication }) => {
  const { timeZone } = usePlatformSettings()
  const job = application.job
  const cv = safeDocumentLink(application.cvLink)
  const coverLetter = safeDocumentLink(application.coverLetterLink)
  const vacancyAvailable = job?.status === 'Open'

  return (
    <article className="border-b border-slate-200 bg-white px-5 py-5 first:border-t sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700">Submitted</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <time className="text-xs text-slate-500" dateTime={application.createdAt}>
              {formatDateInTimeZone(application.createdAt, timeZone)}
            </time>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            {job?.title || 'Vacancy no longer available'}
          </h2>
          {job ? (
            <p className="mt-1 text-sm text-slate-600">
              {job.company?.name || 'Company not specified'}
              {job.location ? ` · ${job.location}` : ''}
            </p>
          ) : null}
        </div>

        {vacancyAvailable && job ? (
          <Link
            href={`/vacancies/${job._id}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
          >
            View vacancy <FiArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-sm text-slate-500">Vacancy closed</span>
        )}
      </div>

      {(cv || coverLetter) ? (
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-sm">
          <span className="text-slate-500">Submitted documents</span>
          {cv ? <a href={cv} target="_blank" rel="noopener noreferrer" className="font-medium text-[#184aa2] hover:underline">CV <span className="sr-only">(opens in a new tab)</span></a> : null}
          {coverLetter ? <a href={coverLetter} target="_blank" rel="noopener noreferrer" className="font-medium text-[#184aa2] hover:underline">Cover letter <span className="sr-only">(opens in a new tab)</span></a> : null}
        </div>
      ) : null}
    </article>
  )
}

const CandidateJobActivity = ({ view, page }: CandidateJobActivityProps) => {
  const router = useRouter()
  const savedJobs = useGetSavedJobs({ enabled: true, page: view === 'saved' ? page : 1, limit: PAGE_SIZE })
  const applications = useGetMyApplications(view === 'applications' ? page : 1, PAGE_SIZE)
  const activeQuery = view === 'saved' ? savedJobs : applications
  const savedTotal = savedJobs.data?.pagination.total ?? 0
  const applicationTotal = applications.data?.pagination.total ?? 0

  const changePage = (nextPage: number) => {
    router.push(`/dashboard/saved-jobs?view=${view}&page=${nextPage}`)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#184aa2]">Your job search</p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.02em] text-slate-950">My jobs</h1>
          <p className="mt-2 text-slate-600">Return to saved vacancies and review every application you have submitted.</p>
        </div>
        <Link href="/vacancies" className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-[#184aa2] px-4 text-sm font-semibold text-white hover:bg-[#123d87]">
          Browse vacancies <FiArrowRight aria-hidden="true" />
        </Link>
      </header>

      <nav aria-label="My jobs sections" className="mt-6 flex gap-6 border-b border-slate-200">
        <Link
          href="/dashboard/saved-jobs?view=saved"
          aria-current={view === 'saved' ? 'page' : undefined}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold ${view === 'saved' ? 'border-[#184aa2] text-[#184aa2]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <FiBookmark aria-hidden="true" /> Saved jobs <span className="text-xs">{savedTotal}</span>
        </Link>
        <Link
          href="/dashboard/saved-jobs?view=applications"
          aria-current={view === 'applications' ? 'page' : undefined}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold ${view === 'applications' ? 'border-[#184aa2] text-[#184aa2]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <FiBriefcase aria-hidden="true" /> Applications <span className="text-xs">{applicationTotal}</span>
        </Link>
      </nav>

      <section aria-labelledby="job-activity-heading" className="pt-7">
        <div className="mb-5">
          <h2 id="job-activity-heading" className="text-xl font-semibold text-slate-950">
            {view === 'saved' ? 'Saved vacancies' : 'Submitted applications'}
          </h2>
          <p className="mt-1 text-sm text-slate-500" aria-live="polite">
            {activeQuery.isLoading ? 'Loading…' : `${view === 'saved' ? savedTotal : applicationTotal} ${view === 'saved' ? 'saved' : 'submitted'}`}
          </p>
        </div>

        {activeQuery.isLoading ? <LoadingCards /> : null}
        {activeQuery.isError ? (
          <div role="alert" className="border-y border-red-200 py-10 text-center">
            <p className="font-semibold text-slate-950">Unable to load your {view === 'saved' ? 'saved jobs' : 'applications'}.</p>
            <button type="button" onClick={() => void activeQuery.refetch()} className="mt-3 text-sm font-semibold text-red-700 underline">Try again</button>
          </div>
        ) : null}

        {!activeQuery.isLoading && !activeQuery.isError && view === 'saved' ? (
          savedJobs.data?.data.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {savedJobs.data.data.map((job) => <SavedVacancyCard key={job._id} job={job} />)}
            </div>
          ) : (
            <div className="border-y border-slate-200 py-14 text-center">
              <FiBookmark aria-hidden="true" className="mx-auto text-2xl text-slate-400" />
              <h3 className="mt-3 font-semibold text-slate-950">No saved vacancies yet</h3>
              <p className="mt-1 text-sm text-slate-600">Save interesting roles while browsing and they will appear here.</p>
            </div>
          )
        ) : null}

        {!activeQuery.isLoading && !activeQuery.isError && view === 'applications' ? (
          applications.data?.data.length ? (
            <div>
              {applications.data.data.map((application) => <ApplicationCard key={application._id} application={application} />)}
            </div>
          ) : (
            <div className="border-y border-slate-200 py-14 text-center">
              <FiFileText aria-hidden="true" className="mx-auto text-2xl text-slate-400" />
              <h3 className="mt-3 font-semibold text-slate-950">No applications yet</h3>
              <p className="mt-1 text-sm text-slate-600">When you apply for a vacancy, your submission will appear here.</p>
            </div>
          )
        ) : null}

        <div className="mt-6">
          <PaginationControls pagination={activeQuery.data?.pagination} onPageChange={changePage} />
        </div>
      </section>
    </div>
  )
}

export default CandidateJobActivity
