'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import { FiLogIn, FiSend } from 'react-icons/fi'

import { useUser } from '@/hooks/useUsers'
import { useCheckApplicationStatus, useSaveJob, useUnsaveJob } from '@/hooks/useVacancies'

export default function JobActions({ jobId, jobTitle }: { jobId: string, jobTitle: string }) {
  const { data: user, isLoading } = useUser()
  const { data: hasApplied, isLoading: loadingApplicationStatus } = useCheckApplicationStatus(
    jobId,
    Boolean(user),
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
    mutation.mutate(jobId, {
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
      {!isAuthed ? (
        <Link
          href={`/auth?next=${encodeURIComponent(`/vacancies/apply/${jobId}`)}`}
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
          href={`/vacancies/apply/${jobId}`}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#184aa2] px-4 py-3 font-semibold text-white transition hover:bg-[#123b82]"
        >
          <FiSend aria-hidden="true" />
          Apply now
        </Link>
      )}

      {!isAuthed ? (
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
          disabled={save.isPending || unsave.isPending}
        >
          {saved ? <BsBookmarkFill aria-hidden="true" /> : <BsBookmark aria-hidden="true" />}
          {saved ? 'Saved' : 'Save job'}
        </button>
      )}

      {saveError ? <p role="alert" className="text-sm text-red-700">{saveError}</p> : null}
    </section>
  )
}
