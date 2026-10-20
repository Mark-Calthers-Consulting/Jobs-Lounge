'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useApplicationFilterOptions } from '@/hooks/useApplicationWorkspace'
import { STAGES } from './workspaceUi'

export default function ApplicationFilters({
  includeVacancy = false,
  academicAssessmentAvailable = true,
}: {
  includeVacancy?: boolean
  academicAssessmentAvailable?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [candidateSearch, setCandidateSearch] = useState('')
  const [jobSearch, setJobSearch] = useState('')
  const selectedCandidateId = searchParams.get('applicantId') || undefined
  const selectedJobId = searchParams.get('jobId') || undefined
  const selectedAcademicAssessment = searchParams.get('academicAssessment') || ''
  const options = useApplicationFilterOptions(
    candidateSearch || undefined,
    includeVacancy ? jobSearch || undefined : undefined,
    selectedCandidateId,
    selectedJobId,
  )

  const update = (name: string, value?: string, repeated = false) => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('cursor')
    if (repeated) {
      const selected = new Set(next.getAll(name))
      if (value && selected.has(value)) selected.delete(value)
      else if (value) selected.add(value)
      next.delete(name)
      selected.forEach((item) => next.append(name, item))
    } else if (value) next.set(name, value)
    else next.delete(name)
    router.replace(`${pathname}?${next}`, { scroll: false })
  }

  const filterKeys = [
    'applicantId', 'jobId', 'status', 'priority', 'education', 'academicAssessment', 'nyscStatus',
    'experienceMin', 'experienceMax', 'profileCompleted', 'appliedFrom',
    'appliedTo', 'hasCv', 'hasCoverLetter',
  ]
  const activeCount = filterKeys.reduce((count, key) => (
    count + (searchParams.has(key) ? 1 : 0)
  ), 0)

  const clear = () => {
    const next = new URLSearchParams(searchParams.toString())
    filterKeys.forEach((key) => next.delete(key))
    next.delete('cursor')
    router.replace(`${pathname}?${next}`, { scroll: false })
  }

  return (
    <details className="rounded-xl border border-slate-200 bg-white" open={activeCount > 0}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">
        <span>Filters {activeCount ? `(${activeCount})` : ''}</span>
        <span aria-hidden="true" className="text-slate-500">⌄</span>
      </summary>
      <div className="border-t border-slate-100 p-4">
        {!academicAssessmentAvailable ? (
          <div role="note" className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p className="text-sm font-semibold">Academic assessment is unavailable for this vacancy</p>
            <p className="mt-1 text-sm text-blue-900">
              This vacancy does not have a minimum academic qualification. Academic assessment filters only apply to vacancies with a minimum.
            </p>
            {selectedAcademicAssessment ? (
              <button
                type="button"
                onClick={() => update('academicAssessment')}
                className="mt-3 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                Clear academic filter
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            Find applicant
            <input value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} placeholder="Name, email or phone…" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Exact applicant
            <select value={selectedCandidateId || ''} onChange={(event) => update('applicantId', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="">Any applicant</option>
              {options.data?.candidates.map((candidate) => <option key={candidate._id} value={candidate._id}>{candidate.name || candidate.email}</option>)}
            </select>
          </label>
          {includeVacancy ? (
            <>
              <label className="text-sm font-medium text-slate-700">
                Find vacancy
                <input value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} placeholder="Vacancy title…" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Exact vacancy
                <select value={selectedJobId || ''} onChange={(event) => update('jobId', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                  <option value="">Any vacancy</option>
                  {options.data?.jobs.map((job) => <option key={job._id} value={job._id}>{job.title}</option>)}
                </select>
              </label>
            </>
          ) : null}
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium text-slate-700">Hiring stages</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {STAGES.map((stage) => {
                const selected = searchParams.getAll('status').includes(stage.value)
                return <button key={stage.value} type="button" aria-pressed={selected} onClick={() => update('status', stage.value, true)} className={`rounded-full border px-3 py-1.5 text-sm ${selected ? 'border-blue-800 bg-blue-50 text-blue-900' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>{stage.label}</button>
              })}
            </div>
          </fieldset>
          <label className="text-sm font-medium text-slate-700">
            Priority
            <select value={searchParams.get('priority') || ''} onChange={(event) => update('priority', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="">Any priority</option><option value="true">Priority only</option><option value="false">Not priority</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Education
            <select value={searchParams.get('education') || ''} onChange={(event) => update('education', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="">Any education</option>
              {options.data?.educationLevels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Academic assessment
            <select
              value={selectedAcademicAssessment}
              onChange={(event) => update('academicAssessment', event.target.value)}
              disabled={!academicAssessmentAvailable}
              aria-describedby={!academicAssessmentAvailable ? 'academic-assessment-unavailable' : undefined}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">Any assessment</option>
              <option value="meets">Academic criteria met</option>
              <option value="one-level-below">One level below</option>
              <option value="two-or-more-levels-below">Two or more levels below</option>
              <option value="not-assessed">Not assessed</option>
            </select>
            {!academicAssessmentAvailable ? (
              <span id="academic-assessment-unavailable" className="mt-1.5 block text-xs font-normal text-slate-500">
                No minimum qualification is set for this vacancy.
              </span>
            ) : null}
          </label>
          <label className="text-sm font-medium text-slate-700">
            NYSC status
            <select value={searchParams.get('nyscStatus') || ''} onChange={(event) => update('nyscStatus', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="">Any NYSC status</option><option value="completed">Completed</option><option value="exempted">Exempted</option><option value="not-started">Not started</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Profile
            <select value={searchParams.get('profileCompleted') || ''} onChange={(event) => update('profileCompleted', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="">Any completion</option><option value="true">Complete</option><option value="false">Incomplete</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Minimum experience<input type="number" min="0" max="60" value={searchParams.get('experienceMin') || ''} onChange={(event) => update('experienceMin', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm font-medium text-slate-700">Maximum experience<input type="number" min="0" max="60" value={searchParams.get('experienceMax') || ''} onChange={(event) => update('experienceMax', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm font-medium text-slate-700">Applied from<input type="date" value={searchParams.get('appliedFrom') || ''} onChange={(event) => update('appliedFrom', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm font-medium text-slate-700">Applied to<input type="date" value={searchParams.get('appliedTo') || ''} onChange={(event) => update('appliedTo', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm font-medium text-slate-700">CV availability<select value={searchParams.get('hasCv') || ''} onChange={(event) => update('hasCv', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Any</option><option value="true">Has CV</option><option value="false">No CV</option></select></label>
          <label className="text-sm font-medium text-slate-700">Cover letter<select value={searchParams.get('hasCoverLetter') || ''} onChange={(event) => update('hasCoverLetter', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Any</option><option value="true">Has cover letter</option><option value="false">No cover letter</option></select></label>
        </div>
        {activeCount ? <button type="button" onClick={clear} className="mt-4 text-sm font-semibold text-blue-800 hover:underline">Clear all filters</button> : null}
      </div>
    </details>
  )
}
