'use client'

import { useApplyToJob } from '@/hooks/useApplications'
import { useUser } from '@/hooks/useUsers'
import { useCheckApplicationStatus } from '@/hooks/useVacancies'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactNode } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import { toast } from 'sonner'
import { DOCUMENT_URL_ERROR, isValidDocumentUrl } from '@/utils/documentUrl'
import CvLinkGuidance from '@/components/CvLinkGuidance'

const fieldClass = 'mt-2 w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#184aa2] focus:ring-2 focus:ring-[#184aa2]/15'
const prefilledFieldClass = 'border-slate-300 bg-slate-50 text-slate-800'
const labelClass = 'block text-[15px] font-semibold leading-5 text-slate-950'

const ProfileValueNotice = ({ children }: { children: ReactNode }) => (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <FiCheckCircle aria-hidden="true" className="shrink-0 text-emerald-700" size={14} />
        {children}
    </p>
)

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

    const cvLoadedFromProfile = cvLink === null && Boolean(user.cvLink?.trim())
    const coverLetterLoadedFromProfile = coverLetterLink === null && Boolean(user.coverLetterLink?.trim())

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-lg border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7"
            aria-busy={apply.isPending}
        >
            <div className="border-b border-slate-200 pb-7">
                <label htmlFor="application-cv" className={labelClass}>CV link</label>
                {cvLoadedFromProfile && (
                    <ProfileValueNotice>Loaded from your profile. You can replace it for this application.</ProfileValueNotice>
                )}
                <CvLinkGuidance id="application-cv-help" />
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
                    className={`${fieldClass} ${cvLoadedFromProfile ? prefilledFieldClass : ''}`}
                />
                {cvLinkError ? (
                    <p id="application-cv-error" role="alert" className="mt-1 text-sm text-red-700">
                        {cvLinkError}
                    </p>
                ) : null}
            </div>
            <div className="border-b border-slate-200 py-7">
                <label htmlFor="application-cover-letter" className={labelClass}>
                    Cover letter link <span className="ml-1 text-xs font-normal text-slate-500">Optional</span>
                </label>
                {coverLetterLoadedFromProfile && (
                    <ProfileValueNotice>Loaded from your profile. You can replace or remove it here.</ProfileValueNotice>
                )}
                <input
                    id="application-cover-letter"
                    type="url"
                    inputMode="url"
                    value={coverLetterLink ?? user.coverLetterLink ?? ''}
                    onChange={(event) => setCoverLetterLink(event.target.value)}
                    placeholder="https://drive.google.com/file/d/your-cover-letter-file-id/view"
                    className={`${fieldClass} ${coverLetterLoadedFromProfile ? prefilledFieldClass : ''}`}
                />
            </div>
            <div className="pt-7">
                <label htmlFor="application-note" className={labelClass}>
                    Note to the hiring team <span className="ml-1 text-xs font-normal text-slate-500">Optional</span>
                </label>
                <p id="application-note-help" className="mt-1 text-sm text-slate-600">
                    Add a short, relevant message for the recruiter reviewing your application.
                </p>
                <textarea
                    id="application-note"
                    maxLength={2000}
                    rows={6}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    aria-describedby="application-note-help application-note-count"
                    className={`${fieldClass} resize-y`}
                />
                <p id="application-note-count" className="mt-1.5 text-right text-xs tabular-nums text-slate-500">{note.length}/2000</p>
            </div>
            <button type="submit" disabled={apply.isPending} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-[#003B6D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002f57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70">
                {apply.isPending ? 'Submitting…' : `Submit application for ${jobTitle}`}
            </button>
        </form>
    )
}

export default ApplicationForm
