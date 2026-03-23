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

  console.log(hasApplied)


  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({ jobId })
      toast.success("Application submitted successfully!")

      queryClient.invalidateQueries({ queryKey: ["application-status", jobId] })
    } catch (error: any) {
      if (error?.message == 'You already applied') {
        toast.error("You already applied to this job")
        console.log(error)
        return
      }
      toast.error("Failed to apply to job")
      console.log(error)
    }
  }


  const [saved, setSaved] = useState(false)

  const isAuthed = !!user

  const body = <p>{`Are you sure you want to apply to ${jobTitle}`}</p>

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
          <FiLogIn />
          Log in to save
        </Link>
      ) : (
        <button
          className="flex my-3 w-full items-center justify-center gap-2 border p-3 rounded cursor-pointer"
          onClick={handleClick}
        >
          {saved ? <BsBookmarkFill /> : <BsBookmark />}
          {saved ? "Saved" : "Save to Favorites"}
        </button>
      )}

      <Modal body={body} actionLabel="Apply" title="Confirm Application" onSubmit={handleApply} onClose={() => setIsOpen(false)} isOpen={isOpen} />

      {/* APPLY */}
      {!isAuthed ? (
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded cursor-pointer"
        >
          <FiLogIn />
          Log in to apply
        </Link>
      ) : hasApplied ? (
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded"
        >
          <FiSend />
          You have applied!
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 bg-black text-white p-3 rounded"
        >
          <FiSend />
          Apply
        </button>
      )}
    </section>
  )
}
