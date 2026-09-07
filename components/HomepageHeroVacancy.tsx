'use client'

import Link from 'next/link'
import { FiArrowRight, FiBriefcase } from 'react-icons/fi'

import { useFeaturedJobs } from '@/hooks/useVacancies'
import { publicEmployerName } from '@/utils/jobPresentation'

export default function HomepageHeroVacancy() {
  const query = useFeaturedJobs()
  const job = query.data?.[0]
  const employer = job ? publicEmployerName(job.company.name) : ''

  if (query.isLoading) {
    return (
      <div role="status" aria-label="Loading latest vacancy" className="absolute bottom-3 left-8 right-3 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:bottom-6 sm:left-auto sm:-right-1 sm:w-[350px]">
        <div className="h-3 w-24 bg-slate-100" />
        <div className="mt-3 h-5 w-56 bg-slate-200" />
        <div className="mt-3 h-3 w-36 bg-slate-100" />
        <span className="sr-only">Loading…</span>
      </div>
    )
  }

  if (!job) return null

  return (
    <Link
      href={`/vacancies/${job._id}`}
      aria-label={`View ${job.title} at ${employer}`}
      className="group absolute bottom-3 left-8 right-3 grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-colors hover:border-slate-300 sm:bottom-6 sm:left-auto sm:-right-1 sm:w-[350px]"
    >
      <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-[#f0f5fc] text-xl text-[#101A35]">
        <FiBriefcase />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase text-[#e23845]">Recently added</span>
        <span className="mt-1 block truncate text-sm font-semibold text-[#101A35]">{job.title}</span>
        <span className="mt-1 block truncate text-xs text-slate-500">{job.location} <span aria-hidden="true">·</span> {job.workMode}</span>
      </span>
      <FiArrowRight aria-hidden="true" className="text-[#184aa2] transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
