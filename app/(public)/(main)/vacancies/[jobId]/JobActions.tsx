'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import { FiLogIn, FiSend } from 'react-icons/fi'
import { PiMapPin } from 'react-icons/pi'

import { useUser } from '@/hooks/useUsers'
import { useCheckApplicationStatus, useSaveJob, useUnsaveJob } from '@/hooks/useVacancies'
import { publicJobLocations } from '@/utils/jobPresentation'
import type { Job } from '@/types/types'

export default function JobActions({
  jobId,
  jobTitle,
  location,
  locationOptions,
}: {
  jobId: string
  jobTitle: string
  location: string
  locationOptions?: Job['locationOptions']
}) {
  const { data: user, isLoading } = useUser()
  const locations = publicJobLocations({ _id: jobId, location, locationOptions })
  const requiresLocationChoice = locations.length > 1
  const [selectedJobId, setSelectedJobId] = useState(requiresLocationChoice ? '' : jobId)
  const hasSelectedLocation = !requiresLocationChoice || Boolean(selectedJobId)
  const targetJobId = selectedJobId || jobId
  const selectedLocation = locations.find(({ jobId: optionJobId }) => optionJobId === selectedJobId)
  const { data: hasApplied, isLoading: loadingApplicationStatus } = useCheckApplicationStatus(
    targetJobId,
    Boolean(user) && hasSelectedLocation,
  )
  const save = useSaveJob()
  const unsave = useUnsaveJob()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const isAuthed = Boolean(user)

  const handleClick = () => {
    const nextSaved = !saved
    const mutation = nextSaved ? save : unsave

    setSaved(nextSaved)
    setSaveError('')
    mutation.mutate(targetJobId, {
      onSuccess: (result) => setSaved(result.saved),
      onError: () => {
        setSaved(!nextSaved)
        setSaveError(nextSaved
          ? 'Unable to save this job. Please try again.'
          : 'Unable to remove this saved job. Please try again.')
      },
    })
  }

  if (isLoading) return null

  return (
    <section aria-label={`Actions for ${jobTitle}`} className="space-y-3">
      {requiresLocationChoice ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label htmlFor="vacancy-location" className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <PiMapPin aria-hidden="true" className="text-lg text-[#184aa2]" />
            Choose a location
          </label>
          <select
            id="vacancy-location"
            value={selectedJobId}
            onChange={(event) => {
              setSelectedJobId(event.target.value)
              setSaved(false)
              setSaveError('')
            }}
            aria-describedby="vacancy-location-help"
            className="mt-3 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#184aa2] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select a location</option>
            {locations.map((option) => (
              <option key={option.jobId} value={option.jobId}>{option.location}</option>
            ))}
          </select>
          <p id="vacancy-location-help" className="mt-2 text-xs text-slate-600">
            Your application will be sent to the vacancy for this location.
          </p>
        </div>
      ) : null}

      {!hasSelectedLocation ? (
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-300 px-4 py-3 font-semibold text-slate-700"
        >
          <FiSend aria-hidden="true" />
          Choose a location to apply
        </button>
      ) : !isAuthed ? (
        <Link
          href={`/auth?next=${encodeURIComponent(`/vacancies/apply/${targetJobId}`)}`}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#184aa2] px-4 py-3 font-semibold text-white transition hover:bg-[#123b82]"
        >
          <FiLogIn aria-hidden="true" />
          Log in to apply
        </Link>
      ) : hasApplied ? (
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-700 px-4 py-3 font-semibold text-white disabled:cursor-default"
        >
          <FiSend aria-hidden="true" />
          Application submitted
        </button>
      ) : loadingApplicationStatus ? (
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#184aa2] px-4 py-3 font-semibold text-white opacity-70"
        >
          <FiSend aria-hidden="true" />
          Checking application status…
        </button>
      ) : (
        <Link
          href={`/vacancies/apply/${targetJobId}`}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#184aa2] px-4 py-3 font-semibold text-white transition hover:bg-[#123b82]"
        >
          <FiSend aria-hidden="true" />
          Apply in {selectedLocation?.location || location}
        </Link>
      )}

      {!hasSelectedLocation ? (
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-500"
        >
          <BsBookmark aria-hidden="true" />
          Choose a location to save
        </button>
      ) : !isAuthed ? (
        <Link
          href={`/auth?next=${encodeURIComponent(`/vacancies/${jobId}`)}`}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
        >
          <FiLogIn aria-hidden="true" />
          Log in to save
        </Link>
      ) : (
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          onClick={handleClick}
          aria-pressed={saved}
          disabled={!hasSelectedLocation || save.isPending || unsave.isPending}
        >
          {saved ? <BsBookmarkFill aria-hidden="true" /> : <BsBookmark aria-hidden="true" />}
          {saved ? 'Saved' : 'Save job'}
        </button>
      )}

      {saveError ? <p role="alert" className="text-sm text-red-700">{saveError}</p> : null}
    </section>
  )
}
