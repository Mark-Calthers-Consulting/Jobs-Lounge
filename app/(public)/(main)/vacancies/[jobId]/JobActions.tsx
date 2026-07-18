"use client"

import Link from "next/link"
import { useState } from "react"
import { useCheckApplicationStatus, useSaveJob, useUnsaveJob } from "@/hooks/useVacancies"
import { BsBookmark, BsBookmarkFill } from "react-icons/bs"
import { FiLogIn, FiSend } from "react-icons/fi"
import { useUser } from "@/hooks/useUsers"
import Modal from "@/components/Modal"
import { useApplyToJob } from "@/hooks/useApplications"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export default function JobActions({ jobId, jobTitle }: { jobId: string, jobTitle: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()
  const { data: user, isLoading } = useUser()
  const { data: hasApplied, isLoading: loadingApplicationStatus } = useCheckApplicationStatus(jobId)
  const save = useSaveJob()
  const unsave = useUnsaveJob()
  const applyMutation = useApplyToJob()

  const handleApply = async () => {
    if (!user?.cvLink) {
      toast.error('You cannot apply to this job without providing a link to your CV on your dashboard!')
      return
    }

    try {
      await applyMutation.mutateAsync({ jobId })
      toast.success("Application submitted successfully!")
      setIsOpen(false)

      queryClient.invalidateQueries({ queryKey: ["application-status", jobId] })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'You already applied') {
        toast.error("You already applied to this job")
        return
      }
      toast.error("Failed to apply to job")
    }
  }


  const [saved, setSaved] = useState(false)

  const isAuthed = !!user

  const body = <p>{`Are you sure you want to apply to ${jobTitle}?`}</p>

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
          href="/auth"
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

      <Modal body={body} actionLabel={applyMutation.isPending ? "Submitting…" : "Apply"} title="Confirm Application" onSubmit={handleApply} onClose={() => setIsOpen(false)} isOpen={isOpen} disabled={applyMutation.isPending} />


      {
        user?.cvLink
          ? <p className="my-3 text-sm text-green-800" role="status">Your CV link is ready.</p>
          : <p className="my-3 text-sm text-amber-800" role="status">Add a CV link in your profile before applying.</p>
      }

      {/* APPLY */}
      {!isAuthed ? (
        <Link
          href="/auth"
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
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={loadingApplicationStatus}
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded"
        >
          <FiSend aria-hidden="true" />
          {loadingApplicationStatus ? 'Checking application status…' : 'Apply'}
        </button>
      )}
    </section>
  )
}
