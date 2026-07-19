'use client'

import { useApplyToJob } from '@/hooks/useApplications'
import { useUser } from '@/hooks/useUsers'
import { useCheckApplicationStatus } from '@/hooks/useVacancies'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

const fieldClass = 'w-full rounded border border-gray-300 px-3 py-2'

const ApplicationForm = ({ jobId, jobTitle }: { jobId: string; jobTitle: string }) => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: user, isLoading: loadingUser } = useUser()
    const { data: hasApplied, isLoading: checkingStatus } = useCheckApplicationStatus(jobId, Boolean(user))
    const apply = useApplyToJob()
    const [cvLink, setCvLink] = useState<string | null>(null)
    const [coverLetterLink, setCoverLetterLink] = useState<string | null>(null)
    const [note, setNote] = useState('')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await apply.mutateAsync({
                jobId,
                cvLink: cvLink ?? user?.cvLink ?? '',
                ...((coverLetterLink ?? user?.coverLetterLink) ? { coverLetterLink: coverLetterLink ?? user?.coverLetterLink } : {}),
                ...(note.trim() ? { note: note.trim() } : {}),
            })
            await queryClient.invalidateQueries({ queryKey: ['application-status', jobId] })
            toast.success('Application submitted successfully')
            router.replace(`/vacancies/${jobId}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to submit application')
        }
    }

    if (loadingUser || checkingStatus) return <p role="status">Preparing your application…</p>
    if (!user) {
        return <p>Please <Link className="underline" href={`/auth?next=${encodeURIComponent(`/vacancies/apply/${jobId}`)}`}>log in</Link> to apply.</p>
    }
    if (hasApplied) {
        return <p role="status" className="rounded bg-green-50 p-4 text-green-900">You have already applied for this role.</p>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={apply.isPending}>
            <div>
                <label htmlFor="application-cv" className="mb-1 block font-medium">CV link</label>
                <input id="application-cv" type="url" required value={cvLink ?? user.cvLink ?? ''} onChange={(event) => setCvLink(event.target.value)} placeholder="https://drive.google.com/…" className={fieldClass} />
                <p className="mt-1 text-sm text-gray-600">Make sure the hiring team can open this link.</p>
            </div>
            <div>
                <label htmlFor="application-cover-letter" className="mb-1 block font-medium">Cover letter link <span className="font-normal text-gray-600">(optional)</span></label>
                <input id="application-cover-letter" type="url" value={coverLetterLink ?? user.coverLetterLink ?? ''} onChange={(event) => setCoverLetterLink(event.target.value)} className={fieldClass} />
            </div>
            <div>
                <label htmlFor="application-note" className="mb-1 block font-medium">Note to the hiring team <span className="font-normal text-gray-600">(optional)</span></label>
                <textarea id="application-note" maxLength={2000} rows={6} value={note} onChange={(event) => setNote(event.target.value)} className={fieldClass} />
                <p className="mt-1 text-right text-sm text-gray-600">{note.length}/2000</p>
            </div>
            <button type="submit" disabled={apply.isPending} className="rounded bg-black px-5 py-3 text-white disabled:cursor-wait disabled:opacity-70">
                {apply.isPending ? 'Submitting…' : `Submit application for ${jobTitle}`}
            </button>
        </form>
    )
}

export default ApplicationForm
