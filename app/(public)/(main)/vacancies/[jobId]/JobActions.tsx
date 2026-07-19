"use client"

import Link from "next/link"
import { useState } from "react"
import { useCheckApplicationStatus, useSaveJob, useUnsaveJob } from "@/hooks/useVacancies"
import { BsBookmark, BsBookmarkFill } from "react-icons/bs"
import { FiLogIn, FiSend } from "react-icons/fi"
import { useUser } from "@/hooks/useUsers"

export default function JobActions({ jobId }: { jobId: string, jobTitle: string }) {
  const { data: user, isLoading } = useUser()
  const { data: hasApplied, isLoading: loadingApplicationStatus } = useCheckApplicationStatus(jobId, Boolean(user))
  const save = useSaveJob()
  const unsave = useUnsaveJob()


  const [saved, setSaved] = useState(false)

  const isAuthed = !!user

  const handleClick = () => {
    setSaved((prev) => !prev)

    if (!saved) {
      save.mutate(jobId)
    } else {
      unsave.mutate(jobId)
    }
  }

  if (isLoading) return null

  return (
    <section className="mt-4">
      {/* SAVE */}
      {!isAuthed ? (
        <Link
          href={`/auth?next=${encodeURIComponent(`/vacancies/${jobId}`)}`}
          className="flex my-3 items-center justify-center gap-2 border p-3 rounded cursor-pointer"
        >
          <FiLogIn aria-hidden="true" />
          Log in to save
        </Link>
      ) : (
        <button
          type="button"
          className="flex my-3 w-full items-center justify-center gap-2 border p-3 rounded cursor-pointer"
          onClick={handleClick}
          aria-pressed={saved}
          disabled={save.isPending || unsave.isPending}
        >
          {saved ? <BsBookmarkFill aria-hidden="true" /> : <BsBookmark aria-hidden="true" />}
          {saved ? "Saved" : "Save to Favorites"}
        </button>
      )}

      {/* APPLY */}
      {!isAuthed ? (
        <Link
          href={`/auth?next=${encodeURIComponent(`/vacancies/apply/${jobId}`)}`}
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded cursor-pointer"
        >
          <FiLogIn aria-hidden="true" />
          Log in to apply
        </Link>
      ) : hasApplied ? (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded"
        >
          <FiSend aria-hidden="true" />
          You have applied!
        </button>
      ) : loadingApplicationStatus ? (
        <button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded bg-black p-3 text-white opacity-70">
          <FiSend aria-hidden="true" />
          Checking application status…
        </button>
      ) : (
        <Link
          href={`/vacancies/apply/${jobId}`}
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded"
        >
          <FiSend aria-hidden="true" />
          Apply
        </Link>
      )}
    </section>
  )
}
