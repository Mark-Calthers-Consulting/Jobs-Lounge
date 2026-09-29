'use client'

import Link from 'next/link'
import type { IconType } from 'react-icons'
import {
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCode,
  FiCompass,
  FiGlobe,
  FiHeadphones,
  FiHeart,
  FiHome,
  FiMap,
  FiMapPin,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiTarget,
  FiTool,
  FiTrendingUp,
  FiTruck,
  FiUsers,
  FiZap,
} from 'react-icons/fi'
import { PiSuitcaseSimpleFill } from 'react-icons/pi'

import { useFeaturedJobs, useJobFilterOptions } from '@/hooks/useVacancies'
import type { Job, JobFilterOption } from '@/types/types'
import { publicEmployerName, publicJobLocations, publicJobLocationSummary } from '@/utils/jobPresentation'

const categoryIcons: Record<string, IconType> = {
  FMCG: FiShoppingBag,
  'Manufacturing & Production': FiSettings,
  'Oil, Gas & Energy': FiZap,
  'Banking, Finance & Insurance': FiBarChart2,
  'Technology & ICT': FiCode,
  'Legal, Compliance & Audit': FiShield,
  'Real Estate & Construction': FiHome,
  'Consulting & Strategy': FiCompass,
  'Supply Chain, Procurement & Logistics': FiTruck,
  'Human Resources & Admin': FiUsers,
  'Sales, Marketing & Retail': FiTrendingUp,
  'Customer Service & Support': FiHeadphones,
  'Healthcare & Pharmaceuticals': FiHeart,
  'Hospitality, Travel & Tourism': FiMap,
  'Education & Training': FiBookOpen,
  'Engineering (Non-IT)': FiTool,
  'NGO & Non-Profit': FiGlobe,
  Other: FiTarget,
}

export const featuredCategories = (categories: JobFilterOption[] = []) => (
  [...categories]
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .slice(0, 6)
)

const money = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${value.toLocaleString('en-NG')} ${currency}`
  }
}

export const vacancySalary = (job: Job) => {
  const minimum = job.salary?.min
  const maximum = job.salary?.max
  const currency = job.salary?.currency || 'NGN'

  if (minimum === undefined && maximum === undefined) return 'Salary not specified'
  if (minimum !== undefined && maximum !== undefined) {
    if (minimum === maximum) return money(minimum, currency)
    return `${money(minimum, currency)} – ${money(maximum, currency)}`
  }
  if (minimum !== undefined) return `From ${money(minimum, currency)}`
  return `Up to ${money(maximum as number, currency)}`
}

const LoadingTiles = () => (
  <div
    role="status"
    aria-label="Loading vacancy categories"
    className="grid grid-cols-2 border-y border-slate-200 sm:grid-cols-3 lg:grid-cols-6"
  >
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className="min-h-24 animate-pulse border-l border-slate-200 bg-white p-4 first:border-l-0"
      >
        <div className="h-4 w-2/3 bg-slate-200" />
        <div className="mt-4 h-3 w-1/3 bg-slate-100" />
        <div className="mt-3 h-3 w-1/2 bg-slate-100" />
      </div>
    ))}
    <span className="sr-only">Loading…</span>
  </div>
)

const LatestVacanciesLoading = () => (
  <div role="status" aria-label="Loading latest vacancies" className="grid animate-pulse gap-4 lg:grid-cols-[0.92fr_1.08fr]">
    <div className="min-h-[340px] rounded-md bg-blue-100 p-7">
      <div className="h-3 w-24 bg-blue-200" />
      <div className="mt-28 h-8 w-3/4 bg-blue-200" />
      <div className="mt-5 h-4 w-1/2 bg-blue-200" />
    </div>
    <div className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex min-h-[68px] items-center gap-4 px-5">
          <div className="size-9 bg-slate-100" />
          <div className="flex-1">
            <div className="h-3 w-1/2 bg-slate-200" />
            <div className="mt-2 h-2.5 w-1/3 bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
    <span className="sr-only">Loading…</span>
  </div>
)

const SectionError = ({ message, retry }: { message: string; retry: () => void }) => (
  <div className="border border-slate-200 bg-white px-6 py-8 text-center">
    <p role="alert" className="text-sm text-slate-600">{message}</p>
    <button
      type="button"
      onClick={retry}
      className="mt-4 inline-flex min-h-10 items-center gap-2 border border-slate-300 px-4 text-sm font-semibold text-[#101A35] transition-colors hover:border-slate-400 hover:bg-slate-50"
    >
      <FiRefreshCw aria-hidden="true" /> Try again
    </button>
  </div>
)

const CategoryDirectory = () => {
  const query = useJobFilterOptions()
  const categories = featuredCategories(query.data?.categories)

  return (
    <section aria-labelledby="category-heading" className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="h-9 w-0.5 bg-[#e23845]" />
            <h2 id="category-heading" className="font-editorial text-3xl font-normal tracking-[-0.025em] text-[#101A35] sm:text-[2rem]">
              Find the right opportunity for you
            </h2>
          </div>
          <Link href="/vacancies" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline">
            Browse all vacancies <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7" aria-busy={query.isLoading}>
          {query.isLoading ? <LoadingTiles /> : null}
          {query.isError ? (
            <SectionError
              message="We couldn’t load vacancy categories."
              retry={() => void query.refetch()}
            />
          ) : null}
          {!query.isLoading && !query.isError && categories.length === 0 ? (
            <div className="border border-slate-200 px-6 py-9">
              <h3 className="font-semibold text-[#101A35]">New fields are opening soon</h3>
              <p className="mt-2 text-sm text-slate-600">Browse all vacancies to see the opportunities currently available.</p>
              <Link href="/vacancies" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline">
                Browse vacancies <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}
          {!query.isLoading && !query.isError && categories.length > 0 ? (
            <div className="grid grid-cols-2 border-t border-slate-200 sm:grid-cols-3 lg:grid-cols-6 lg:border-b">
              {categories.map((category, index) => {
                const countLabel = `${category.count.toLocaleString('en-NG')} ${category.count === 1 ? 'vacancy' : 'vacancies'}`
                const mobileBorder = index % 2 === 0 ? 'border-l-0' : 'border-l'
                const tabletBorder = index % 3 === 0 ? 'sm:border-l-0' : 'sm:border-l'
                const desktopBorder = index === 0 ? 'lg:border-l-0' : 'lg:border-l'
                return (
                  <Link
                    key={category.value}
                    href={`/vacancies?category=${encodeURIComponent(category.value)}`}
                    className={`group relative flex min-h-24 flex-col justify-center border-b border-slate-200 px-4 py-4 transition-colors hover:bg-slate-50 sm:min-h-28 lg:border-b-0 ${mobileBorder} ${tabletBorder} ${desktopBorder}`}
                  >
                    <span className="block pr-5 text-sm font-semibold leading-5 text-[#101A35]">{category.value}</span>
                    <span className="mt-1 block text-xs text-slate-500">{countLabel}</span>
                    <FiArrowRight aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#184aa2]" />
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

const FeaturedVacancy = ({ job }: { job: Job }) => {
  const employer = publicEmployerName(job.company.name)
  const salary = vacancySalary(job)
  const locations = publicJobLocations(job)

  return (
    <article className="flex min-h-[340px] flex-col rounded-md bg-[#0d4fd7] p-7 text-white sm:p-9">
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs font-semibold uppercase text-blue-100">Newest vacancy</p>
      <span className="border border-white/30 px-2.5 py-1 text-xs font-medium text-white">{job.jobType}</span>
    </div>
    <span aria-hidden="true" className="mt-8 grid size-12 place-items-center rounded-md bg-white text-xl text-[#0d4fd7]">
      <PiSuitcaseSimpleFill />
    </span>
    <p className="mt-auto text-xs font-semibold uppercase text-blue-100">{job.category}</p>
    <h3 className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl">{job.title}</h3>
    <p className="mt-2 text-sm text-blue-100">{employer}</p>
    <dl className="mt-5 flex flex-col gap-2 text-sm text-blue-50 sm:flex-row sm:flex-wrap sm:gap-x-6">
      <div className="flex items-center gap-2">
        <FiMapPin aria-hidden="true" />
        <dt className="sr-only">Location and work arrangement</dt>
        <dd>
          {publicJobLocationSummary(job, { compact: true })}
          {locations.length > 1 ? ` (${locations.length} locations)` : ''}
          {' '}<span aria-hidden="true">·</span> {job.workMode}
        </dd>
      </div>
      {salary !== 'Salary not specified' ? (
        <div className="flex items-center gap-2">
          <FiBriefcase aria-hidden="true" />
          <dt className="sr-only">Salary</dt>
          <dd>{salary}</dd>
        </div>
      ) : null}
    </dl>
    <div className="mt-7 border-t border-white/25 pt-5">
      <Link
        href={`/vacancies/${job._id}`}
        aria-label={`View ${job.title} at ${employer}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
      >
        View vacancy <FiArrowRight aria-hidden="true" />
      </Link>
    </div>
  </article>
  )
}

const VacancyRow = ({ job }: { job: Job }) => {
  const Icon = categoryIcons[job.category] || FiBriefcase
  const employer = publicEmployerName(job.company.name)
  const locations = publicJobLocations(job)

  return (
    <article>
    <Link
      href={`/vacancies/${job._id}`}
      aria-label={`View ${job.title} at ${employer}`}
      className="group grid min-h-[68px] grid-cols-[40px_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-5"
    >
      <span aria-hidden="true" className="grid size-10 place-items-center rounded-md bg-slate-100 text-[#184aa2]">
        <Icon />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#101A35]">{job.title}</span>
        <span className="mt-1 block truncate text-xs text-slate-500">
          {employer} <span aria-hidden="true">·</span>{' '}
          {locations.length > 1 ? `${locations.length} locations` : job.location}
          {' '}<span aria-hidden="true">·</span> {job.workMode}
        </span>
      </span>
      <FiArrowRight aria-hidden="true" className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#184aa2]" />
    </Link>
  </article>
  )
}

const LatestVacancies = () => {
  const query = useFeaturedJobs()
  const jobs = query.data?.slice(0, 6) ?? []

  return (
    <section aria-labelledby="latest-vacancies-heading" className="border-y border-slate-200 bg-[#fbfcfe] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="h-9 w-0.5 bg-[#e23845]" />
            <h2 id="latest-vacancies-heading" className="font-editorial text-3xl font-normal tracking-[-0.025em] text-[#101A35] sm:text-[2rem]">
              Latest opportunities
            </h2>
          </div>
          <Link href="/vacancies" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline">
            Browse all vacancies <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9" aria-busy={query.isLoading}>
          {query.isLoading ? <LatestVacanciesLoading /> : null}
          {query.isError ? (
            <SectionError
              message="We couldn’t load the latest vacancies."
              retry={() => void query.refetch()}
            />
          ) : null}
          {!query.isLoading && !query.isError && jobs.length === 0 ? (
            <div className="border border-slate-200 bg-white px-6 py-10 text-center">
              <h3 className="font-semibold text-[#101A35]">More opportunities are on the way</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">There are no open vacancies to show right now. Check back soon for newly published roles.</p>
            </div>
          ) : null}
          {!query.isLoading && !query.isError && jobs.length > 0 ? (
            <div className={`grid gap-4 ${jobs.length > 1 ? 'lg:grid-cols-[0.92fr_1.08fr]' : ''}`}>
              <FeaturedVacancy job={jobs[0]} />
              {jobs.length > 1 ? (
                <div className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white">
                  {jobs.slice(1).map((job) => <VacancyRow key={job._id} job={job} />)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default function HomepageDiscovery() {
  return (
    <>
      <CategoryDirectory />
      <LatestVacancies />
    </>
  )
}
