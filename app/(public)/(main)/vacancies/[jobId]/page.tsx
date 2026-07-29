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
        <section>
            <div aria-hidden="true" className="h-24 w-full bg-[#333]" />
            <JobDetailContent
                job={job}
                sidebarContent={(
                    <>
                        <JobActions jobId={jobId} jobTitle={job.title} />

                        <section className="my-5 space-y-2">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex cursor-pointer items-center gap-2 rounded border border-gray-300 p-2 text-sm transition hover:bg-gray-50"
                            >
                                <FaFacebook aria-hidden="true" className="text-lg text-blue-600" />
                                <span>Share on Facebook <span className="sr-only">(opens in a new tab)</span></span>
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`Check out this ${job.title} role at ${job.company.name}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex cursor-pointer items-center gap-2 rounded border border-gray-300 p-2 text-sm transition hover:bg-gray-50"
                            >
                                <FaXTwitter aria-hidden="true" className="text-lg text-black" />
                                <span>Share on X <span className="sr-only">(opens in a new tab)</span></span>
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex cursor-pointer items-center gap-2 rounded border border-gray-300 p-2 text-sm transition hover:bg-gray-50"
                            >
                                <BsLinkedin aria-hidden="true" className="text-lg text-blue-700" />
                                <span>Share on LinkedIn <span className="sr-only">(opens in a new tab)</span></span>
                            </a>
                        </section>

                        <CopyLink />
                    </>
                )}
            />
        </section>
    )
}

export default JobPage
