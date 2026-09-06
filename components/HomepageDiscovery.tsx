'use client'

import Link from 'next/link'
import type { IconType } from 'react-icons'
import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCode,
  FiCompass,
  FiGlobe,
  FiHeadphones,
  FiHeart,
  FiHome,
  FiLayers,
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

import { useFeaturedJobs, useJobFilterOptions } from '@/hooks/useVacancies'
import type { Job, JobFilterOption } from '@/types/types'

const categoryIcons: Record<string, IconType> = {
  FMCG: FiShoppingBag,
  'Manufacturing & Production': FiSettings,
  'Oil, Gas & Energy': FiZap,
  'Banking, Finance & Insurance': FiTrendingUp,
  'Technology & ICT': FiCode,
  'Legal, Compliance & Audit': FiShield,
  'Real Estate & Construction': FiHome,
  'Consulting & Strategy': FiCompass,
  'Supply Chain, Procurement & Logistics': FiTruck,
  'Human Resources & Admin': FiUsers,
  'Sales, Marketing & Retail': FiTarget,
  'Customer Service & Support': FiHeadphones,
  'Healthcare & Pharmaceuticals': FiHeart,
  'Hospitality, Travel & Tourism': FiMap,
  'Education & Training': FiBookOpen,
  'Engineering (Non-IT)': FiTool,
  'NGO & Non-Profit': FiGlobe,
  Other: FiBriefcase,
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

const LoadingTiles = ({ cards = false }: { cards?: boolean }) => (
  <div
    role="status"
    aria-label={cards ? 'Loading latest vacancies' : 'Loading vacancy categories'}
    className={`grid gap-3 ${cards ? 'md:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
  >
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className={`animate-pulse border border-slate-200 bg-white ${cards ? 'min-h-64 p-6' : 'min-h-32 p-5'}`}
      >
        <div className="h-4 w-2/3 bg-slate-200" />
        <div className="mt-4 h-3 w-1/3 bg-slate-100" />
        {cards ? <div className="mt-16 h-3 w-full bg-slate-100" /> : null}
      </div>
    ))}
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
    <section aria-labelledby="category-heading" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#184aa2]">Explore your field</p>
            <h2 id="category-heading" className="mt-2 max-w-xl text-3xl font-bold tracking-[-0.025em] text-[#101A35] sm:text-4xl">
              Find opportunities in the work you know
            </h2>
          </div>
          <Link href="/vacancies" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline">
            View every category <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9" aria-busy={query.isLoading}>
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = categoryIcons[category.value] || FiLayers
                const countLabel = `${category.count.toLocaleString('en-NG')} ${category.count === 1 ? 'vacancy' : 'vacancies'}`
                return (
                  <Link
                    key={category.value}
                    href={`/vacancies?category=${encodeURIComponent(category.value)}`}
                    className="group flex min-h-32 items-start justify-between border border-slate-200 bg-white p-5 transition-colors hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span>
                      <span className="flex size-9 items-center justify-center bg-slate-100 text-[#184aa2]">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="mt-5 block font-semibold text-[#101A35]">{category.value}</span>
                      <span className="mt-1 block text-sm text-slate-500">{countLabel}</span>
                    </span>
                    <FiArrowRight aria-hidden="true" className="mt-1 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#184aa2]" />
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

const VacancyCard = ({ job }: { job: Job }) => (
  <article className="flex min-h-72 flex-col border border-slate-200 bg-white p-6">
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#184aa2]">{job.category}</p>
      <span className="shrink-0 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{job.jobType}</span>
    </div>
    <h3 className="mt-5 text-xl font-semibold leading-7 text-[#101A35]">{job.title}</h3>
    <p className="mt-2 text-sm font-medium text-slate-700">{job.company.name}</p>

    <dl className="mt-6 space-y-2.5 text-sm text-slate-600">
      <div className="flex items-start gap-2">
        <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
        <dt className="sr-only">Location and work arrangement</dt>
        <dd>{job.location} <span aria-hidden="true">·</span> {job.workMode}</dd>
      </div>
      <div className="flex items-start gap-2">
        <FiBriefcase aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
        <dt className="sr-only">Salary</dt>
        <dd>{vacancySalary(job)}</dd>
      </div>
    </dl>

    <div className="mt-auto border-t border-slate-200 pt-5">
      <Link
        href={`/vacancies/${job._id}`}
        aria-label={`View ${job.title} at ${job.company.name}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline"
      >
        View vacancy <FiArrowRight aria-hidden="true" />
      </Link>
    </div>
  </article>
)

const LatestVacancies = () => {
  const query = useFeaturedJobs()
  const jobs = query.data?.slice(0, 6) ?? []

  return (
    <section aria-labelledby="latest-vacancies-heading" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#184aa2]">Recently added</p>
            <h2 id="latest-vacancies-heading" className="mt-2 text-3xl font-bold tracking-[-0.025em] text-[#101A35] sm:text-4xl">
              Latest opportunities
            </h2>
          </div>
          <Link href="/vacancies" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline">
            Browse all vacancies <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9" aria-busy={query.isLoading}>
          {query.isLoading ? <LoadingTiles cards /> : null}
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
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => <VacancyCard key={job._id} job={job} />)}
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
