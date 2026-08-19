'use client'

import { useApplyToJob } from '@/hooks/useApplications'
import { useUser } from '@/hooks/useUsers'
import { useCheckApplicationStatus } from '@/hooks/useVacancies'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { DOCUMENT_URL_ERROR, isValidDocumentUrl } from '@/utils/documentUrl'
import CvLinkGuidance from '@/components/CvLinkGuidance'

const fieldClass = 'w-full rounded border border-gray-300 px-3 py-2'

const ApplicationForm = ({ jobId, jobTitle }: { jobId: string; jobTitle: string }) => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: user, isLoading: loadingUser } = useUser()
    const { data: hasApplied, isLoading: checkingStatus } = useCheckApplicationStatus(jobId, Boolean(user))
    const apply = useApplyToJob()
    const [cvLink, setCvLink] = useState<string | null>(null)
    const [cvLinkError, setCvLinkError] = useState('')
    const [coverLetterLink, setCoverLetterLink] = useState<string | null>(null)
    const [note, setNote] = useState('')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const submittedCvLink = (cvLink ?? user?.cvLink ?? '').trim()
        if (!isValidDocumentUrl(submittedCvLink)) {
            setCvLinkError(DOCUMENT_URL_ERROR)
            document.getElementById('application-cv')?.focus()
            return
        }
        setCvLinkError('')
        try {
            await apply.mutateAsync({
                jobId,
                cvLink: submittedCvLink,
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
        <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-busy={apply.isPending}>
            <div>
                <label htmlFor="application-cv" className="mb-1 block font-medium">CV link</label>
                <input
                    id="application-cv"
                    type="url"
                    inputMode="url"
                    required
                    value={cvLink ?? user.cvLink ?? ''}
                    onChange={(event) => {
                        setCvLink(event.target.value)
                        if (cvLinkError) setCvLinkError('')
                    }}
                    placeholder="https://drive.google.com/file/d/your-cv-file-id/view"
                    aria-invalid={Boolean(cvLinkError)}
                    aria-describedby={`application-cv-help${cvLinkError ? ' application-cv-error' : ''}`}
                    className={fieldClass}
                />
                <CvLinkGuidance id="application-cv-help" />
                {cvLinkError ? (
                    <p id="application-cv-error" role="alert" className="mt-1 text-sm text-red-700">
                        {cvLinkError}
                    </p>
                ) : null}
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
