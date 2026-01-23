"use client"

import Link from "next/link"
import { useState } from "react"
import { useUser } from "@/hooks/useAuth"
import { useSaveJob, useUnsaveJob } from "@/hooks/useVacancies"
import { BsBookmark, BsBookmarkFill } from "react-icons/bs"
import { FiLogIn, FiSend } from "react-icons/fi"

export default function JobActions({ jobId }: { jobId: string }) {
  const { data: user, isLoading } = useUser()
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
    <section className="mt-4 space-y-3">
      {/* SAVE */}
      {!isAuthed ? (
        <Link
          href="/auth"
          className="flex items-center justify-center gap-2 border p-3 rounded cursor-pointer"
        >
          <FiLogIn />
          Log in to save
        </Link>
      ) : (
        <button
          className="flex w-full items-center justify-center gap-2 border p-3 rounded cursor-pointer"
          onClick={handleClick}
        >
          {saved ? <BsBookmarkFill /> : <BsBookmark />}
          {saved ? "Saved" : "Save to Favorites"}
        </button>
      )}

      {/* APPLY */}
      {!isAuthed ? (
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded cursor-pointer"
        >
          <FiLogIn />
          Log in to apply
        </Link>
      ) : (
        <button className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded">
          <FiSend />
          Apply
        </button>
      )}
    </section>
  )
}
