import { notFound } from 'next/navigation'
import { BsLinkedin } from 'react-icons/bs'
import { FaFacebook } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

import { readApiResponse } from '@/api/errors'
import { serverApiUrl } from '@/api/serverBase'
import CopyLink from '@/components/CopyLink'
import JobDetailContent from '@/components/JobDetailContent'
import type { ApiSuccess, Job, JobPageProps } from '@/types/types'

import JobActions from './JobActions'

const getSingleJob = async (id: string): Promise<Job> => {
    const res = await fetch(
        serverApiUrl(`/jobs/${encodeURIComponent(id)}`),
        { cache: 'no-store' },
    )

    if (res.status === 404) notFound()

    const data = await readApiResponse<ApiSuccess<Job>>(res, 'Failed to fetch job')
    return data.data
}

const JobPage = async ({ params }: JobPageProps) => {
    const { jobId } = await params
    const job = await getSingleJob(jobId)
    const baseUrl = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000'
    const currentUrl = `${baseUrl}/vacancies/${jobId}`
    const encodedUrl = encodeURIComponent(currentUrl)

    return (
        <section aria-label={`${job.title} vacancy`}>
            <JobDetailContent
                job={job}
                backHref="/vacancies"
                sidebarContent={(
                    <>
                        <JobActions jobId={jobId} jobTitle={job.title} />

                        <section aria-labelledby="share-vacancy-title" className="border-t border-slate-200 pt-5">
                            <h2 id="share-vacancy-title" className="text-sm font-semibold text-slate-700">
                                Share this vacancy
                            </h2>
                            <div className="mt-3 flex items-center gap-2">
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Share on LinkedIn (opens in a new tab)"
                                    title="Share on LinkedIn"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-[#0a66c2] transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    <BsLinkedin aria-hidden="true" />
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`Check out this ${job.title} role at ${job.company.name}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Share on X (opens in a new tab)"
                                    title="Share on X"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    <FaXTwitter aria-hidden="true" />
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Share on Facebook (opens in a new tab)"
                                    title="Share on Facebook"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-[#1877f2] transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    <FaFacebook aria-hidden="true" />
                                </a>
                                <CopyLink />
                            </div>
                        </section>
                    </>
                )}
            />
        </section>
    )
}

export default JobPage
