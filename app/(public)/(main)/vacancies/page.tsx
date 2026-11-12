'use client'

import Link from 'next/link'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import JobFilters, { type VacancyFilterState } from '@/components/JobFilters'
import PaginationControls from '@/components/PaginationControls'
import {
  JOB_ENUMS,
  type Category,
  type JobType,
  type Level,
  type WorkMode,
} from '@/constants/enums'
import { useJobFilterOptions, useVacancies } from '@/hooks/useVacancies'
import type {
  Job,
  VacancyDatePosted,
  VacancyFilters,
  VacancySort,
} from '@/types/types'
import { publicJobLocations, publicJobLocationSummary } from '@/utils/jobPresentation'

const VACANCIES_PER_PAGE = 18

const FILTER_PARAM_NAMES = [
  'category',
  'workMode',
  'jobType',
  'level',
  'location',
  'datePosted',
  'experienceMin',
  'experienceMax',
  'salaryMin',
  'salaryDisclosed',
] as const

const validSelections = <T extends string>(
  params: URLSearchParams,
  name: string,
  allowed: readonly T[],
): T[] => [...new Set(params.getAll(name))]
  .filter((value): value is T => allowed.includes(value as T))

const locationsFromParams = (params: URLSearchParams) => (
  [...new Set(params.getAll('location').map((value) => value.trim()))]
    .filter((value) => (
      value.length > 0
      && value.length <= 120
      && !/[\u0000-\u001f\u007f]/.test(value)
    ))
    .slice(0, 5)
)

const boundedInteger = (
  value: string | null,
  maximum: number,
): number | undefined => {
  if (!value || !/^(0|[1-9]\d*)$/.test(value)) return undefined
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : undefined
}

const filterStateFromParams = (params: URLSearchParams): VacancyFilterState => {
  const experienceMin = boundedInteger(params.get('experienceMin'), 60)
  const requestedExperienceMax = boundedInteger(params.get('experienceMax'), 60)
  const experienceMax = (
    experienceMin !== undefined
    && requestedExperienceMax !== undefined
    && experienceMin > requestedExperienceMax
  )
    ? undefined
    : requestedExperienceMax
  const datePosted = params.get('datePosted')

  return {
    category: validSelections<Category>(params, 'category', JOB_ENUMS.category),
    workMode: validSelections<WorkMode>(params, 'workMode', JOB_ENUMS.workMode),
    jobType: validSelections<JobType>(params, 'jobType', JOB_ENUMS.jobType),
    level: validSelections<Level>(params, 'level', JOB_ENUMS.level),
    location: locationsFromParams(params),
    datePosted: ['24h', '7d', '30d'].includes(datePosted || '')
      ? datePosted as VacancyDatePosted
      : undefined,
    experienceMin,
    experienceMax,
    salaryMin: boundedInteger(params.get('salaryMin'), 1_000_000_000_000),
    salaryDisclosed: params.get('salaryDisclosed') === 'true',
  }
}

const VacanciesContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const urlSearch = searchParams.get('search') ?? ''
  const [inputValue, setInputValue] = useState(urlSearch)

  const filters = useMemo(
    () => filterStateFromParams(new URLSearchParams(queryString)),
    [queryString],
  )
  const page = boundedInteger(searchParams.get('page'), Number.MAX_SAFE_INTEGER) || 1
  const sort: VacancySort = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest'

  const replaceParams = useCallback((
    mutate: (params: URLSearchParams) => void,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(queryString)
    mutate(params)
    if (resetPage) params.delete('page')
    const nextQuery = params.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
  }, [pathname, queryString, router])

  const applyFilters = useCallback((next: VacancyFilterState) => {
    replaceParams((params) => {
      for (const name of FILTER_PARAM_NAMES) params.delete(name)
      for (const value of next.category) params.append('category', value)
      for (const value of next.workMode) params.append('workMode', value)
      for (const value of next.jobType) params.append('jobType', value)
      for (const value of next.level) params.append('level', value)
      for (const value of next.location) params.append('location', value)
      if (next.datePosted) params.set('datePosted', next.datePosted)
      if (next.experienceMin !== undefined) {
        params.set('experienceMin', String(next.experienceMin))
      }
      if (next.experienceMax !== undefined) {
        params.set('experienceMax', String(next.experienceMax))
      }
      if (next.salaryMin !== undefined) params.set('salaryMin', String(next.salaryMin))
      if (next.salaryDisclosed) params.set('salaryDisclosed', 'true')
    })
  }, [replaceParams])

  const clearFilters = useCallback(() => applyFilters({
    category: [],
    workMode: [],
    jobType: [],
    level: [],
    location: [],
    salaryDisclosed: false,
  }), [applyFilters])

  useEffect(() => {
    setInputValue(urlSearch)
  }, [urlSearch])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = inputValue.trim()
      const nextSearch = trimmed.length >= 3 ? trimmed : ''
      if (nextSearch === urlSearch) return
      replaceParams((params) => {
        if (nextSearch) params.set('search', nextSearch)
        else params.delete('search')
      })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [inputValue, replaceParams, urlSearch])

  const vacancyFilters: VacancyFilters = {
    page,
    limit: VACANCIES_PER_PAGE,
    search: urlSearch || undefined,
    category: filters.category,
    workMode: filters.workMode,
    jobType: filters.jobType,
    level: filters.level,
    location: filters.location,
    datePosted: filters.datePosted,
    experienceMin: filters.experienceMin,
    experienceMax: filters.experienceMax,
    salaryMin: filters.salaryMin,
    salaryDisclosed: filters.salaryDisclosed,
    sort,
  }

  const vacancyQuery = useVacancies(vacancyFilters)
  const filterOptionsQuery = useJobFilterOptions()
  const vacancyPage = vacancyQuery.data
  const jobs = vacancyPage?.data ?? []

  return (
    <div>
      <header className="mb-6 w-full bg-[#003B6D]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-12">
          <h1 className="text-xl font-semibold text-white">Find jobs</h1>
          <div className="w-full sm:w-80">
            <label htmlFor="job-search" className="sr-only">Search jobs by title</label>
            <input
              id="job-search"
              type="search"
              maxLength={80}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="w-full rounded-md border border-transparent bg-white px-4 py-2.5 text-black placeholder:text-sm focus:outline-none"
              placeholder="Search jobs by title"
              aria-describedby="job-search-hint"
            />
            <span id="job-search-hint" className="sr-only">
              Enter at least three letters to search.
            </span>
          </div>
          <p className="hidden text-sm text-white/85 sm:block">
            Home <span aria-hidden="true">/</span> Vacancies
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-8 md:px-12">
        <div className="grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] xl:gap-6">
          <JobFilters
            filters={filters}
            options={filterOptionsQuery.data}
            optionsLoading={filterOptionsQuery.isLoading}
            optionsError={filterOptionsQuery.isError}
            onFiltersChange={applyFilters}
            onClearFilters={clearFilters}
          />

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-gray-950" aria-live="polite">
                  {vacancyQuery.isLoading
                    ? 'Loading vacancies…'
                    : vacancyQuery.isError
                      ? 'Vacancies unavailable'
                      : `${(vacancyPage?.pagination.total ?? 0).toLocaleString()} ${(vacancyPage?.pagination.total ?? 0) === 1 ? 'vacancy' : 'vacancies'} found`}
                </p>
                {vacancyQuery.isFetching && !vacancyQuery.isLoading ? (
                  <p role="status" className="text-xs text-gray-500">Updating results…</p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <span>Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => replaceParams((params) => {
                    if (event.target.value === 'newest') params.delete('sort')
                    else params.set('sort', event.target.value)
                  })}
                  className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
            </div>

            <section
              aria-label="Job search results"
              aria-busy={vacancyQuery.isFetching}
              className="grid grid-cols-1 content-start gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {vacancyQuery.isLoading ? (
                <p role="status" className="col-span-full mx-auto py-16 text-xl">Loading vacancies…</p>
              ) : null}

              {vacancyQuery.isError ? (
                <div className="col-span-full py-16 text-center">
                  <p role="alert" className="text-red-700">Could not load vacancies.</p>
                  <button
                    type="button"
                    onClick={() => void vacancyQuery.refetch()}
                    className="mt-3 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
                  >
                    Try again
                  </button>
                </div>
              ) : null}

              {!vacancyQuery.isLoading && !vacancyQuery.isError && jobs.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="px-4 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
                      <svg aria-hidden="true" className="size-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 115.656 5.656M15 15l5 5m-5-5A7 7 0 1110 3a7 7 0 015 12z" />
                      </svg>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-gray-900">No matching vacancies</h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                      Try changing your search or clearing filters to see more vacancies.
                    </p>
                    {FILTER_PARAM_NAMES.some((name) => searchParams.has(name)) ? (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 rounded-md px-3 py-2 text-sm font-semibold text-[#003B6D] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                      >
                        Clear filters
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {!vacancyQuery.isLoading && !vacancyQuery.isError && jobs.length > 0
                ? jobs.map((job: Job) => {
                  const locations = publicJobLocations(job)
                  return (
                    <article key={job._id} className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                      <p className="break-words text-sm text-gray-600 [overflow-wrap:anywhere]">{job.company.name}</p>
                      <h2 className="break-words font-semibold [overflow-wrap:anywhere]">{job.title}</h2>
                      <p className="my-2 break-words leading-5 text-gray-600 [overflow-wrap:anywhere]">
                        {job.description.slice(0, 90)}...
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <p className="rounded bg-[#e3e3e3] px-2 py-1 text-sm text-[#222]">{job.jobType}</p>
                        <p className="rounded bg-[#e3e3e3] px-2 py-1 text-sm text-[#222]">{job.level} level</p>
                      </div>
                      <hr className="my-3 text-[#d4d4d4]" />
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 text-sm text-gray-600">
                          <p className="break-words [overflow-wrap:anywhere]">
                            {publicJobLocationSummary(job, { compact: true })}
                          </p>
                          {locations.length > 1 ? (
                            <p className="mt-1 text-xs font-semibold text-[#184aa2]">
                              {locations.length} locations available
                            </p>
                          ) : null}
                        </div>
                        <Link
                          className="shrink-0 rounded bg-[#003B6D] px-5 py-2 text-sm text-white"
                          href={`/vacancies/${job._id}`}
                          aria-label={`View ${job.title} at ${job.company.name}`}
                        >
                          View job
                        </Link>
                      </div>
                    </article>
                  )
                })
                : null}
            </section>

            <PaginationControls
              pagination={vacancyPage?.pagination}
              onPageChange={(nextPage) => replaceParams((params) => {
                if (nextPage <= 1) params.delete('page')
                else params.set('page', String(nextPage))
              }, false)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

const Vacancies = () => (
  <Suspense fallback={<p role="status" className="p-8 text-center">Loading vacancies…</p>}>
    <VacanciesContent />
  </Suspense>
)

export default Vacancies
