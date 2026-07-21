import { FaFacebook } from 'react-icons/fa'
import type { ApiSuccess, Job, JobPageProps } from '../../../../../types/types'
import CopyLink from '../../../../../components/CopyLink'
import { FaLocationDot, FaXTwitter } from "react-icons/fa6";
import { MdOutlineWorkOutline, MdWorkspacePremium } from "react-icons/md";
import { BsLinkedin } from "react-icons/bs";
import JobActions from './JobActions';
import { notFound } from 'next/navigation';
import { serverApiUrl } from '@/api/serverBase';
import { readApiResponse } from '@/api/errors';
import { formatJobDeadline, isJobDeadlinePast } from '@/utils/jobDeadline';


const getSingleJob = async (id: string): Promise<Job> => {
    const res = await fetch(
        serverApiUrl(`/jobs/${encodeURIComponent(id)}`),
        { cache: 'no-store' }
    )

    if (res.status === 404) {
        notFound()
    }

    const data = await readApiResponse<ApiSuccess<Job>>(res, 'Failed to fetch job')
    return data.data
}

const JobPage = async ({ params }: JobPageProps) => {
    const { jobId } = await params
    const job = await getSingleJob(jobId)

    const baseUrl = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';
    const currentUrl = `${baseUrl}/vacancies/${jobId}`;
    const encodedUrl = encodeURIComponent(currentUrl);
    const deadlinePassed = isJobDeadlinePast(job)

    return (
        <section>
            <div aria-hidden="true" className='bg-[#333] h-24 w-full' />
            <div className='max-w-7xl mx-auto flex flex-col gap-8 md:flex-row pt-8 px-6 md:px-12'>
                <div className="">
                    <section className=''>
                        <h1 className='text-4xl font-bold'>{job.title}</h1>

                        <h2 className='text-2xl'>{job.company.name}</h2>

                        <div className="">
                            <h2 className='font-semibold my-3'>Description</h2>
                            <p className='max-w-3xl'>{job.description}</p>
                        </div>

                        <div className="my-8">
                            <h2 className='font-semibold my-3'>Responsibilities</h2>
                            <ul className='list-disc pl-5 space-y-3'>
                                {job.responsibilities.map((responsibility, index) => (
                                    <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>{responsibility}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="my-8">
                            <h2 className='font-semibold my-3'>Benefits</h2>
                            <ul className='list-disc pl-5 space-y-3'>
                                {job.benefits.map((benefit, index) => (
                                    <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="my-8">
                            <h2 className='font-semibold my-3'>Requirements</h2>
                            <ul className='list-disc pl-5 space-y-3'>
                                {job.requirements.map((requirement, index) => (
                                    <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>{requirement}</li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
                <div className="">
                    <section className='shadow rounded p-4 space-y-2 text-sm'>
                        <h2 className='text-center font-semibold'>Job overview</h2>
                        <div className="flex items-center gap-2">
                            <FaLocationDot color="#0A65CC" aria-hidden="true" />
                            <span>
                                <span className="text-gray-600">Location:</span> {job.location}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MdWorkspacePremium color="#0A65CC" aria-hidden="true" />
                            <span>
                                <span className="text-gray-600">Level:</span> {job.level}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MdOutlineWorkOutline color="#0A65CC" aria-hidden="true" />
                            <span>
                                <span className="text-gray-600">Type:</span> {job.jobType}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Application deadline:</span>{' '}
                            {job.deadline ? formatJobDeadline(job.deadline) : 'No deadline'}
                        </div>
                    </section>

                    {deadlinePassed ? (
                        <p role="status" className="mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                            The listed deadline has passed, but this vacancy remains open and applications are still being accepted.
                        </p>
                    ) : null}

                    <JobActions jobId={jobId} jobTitle={job?.title} />

                    <section className='my-5 space-y-2'>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-300 p-2 text-sm rounded hover:bg-gray-50 cursor-pointer transition"
                        >
                            <FaFacebook aria-hidden="true" className="text-blue-600 text-lg" />
                            <span>Share on Facebook <span className="sr-only">(opens in a new tab)</span></span>
                        </a>

                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`Check out this ${job.title} role at ${job.company.name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-300 p-2 text-sm rounded hover:bg-gray-50 cursor-pointer transition"
                        >
                            <FaXTwitter aria-hidden="true" className="text-black text-lg" />
                            <span>Share on X <span className="sr-only">(opens in a new tab)</span></span>
                        </a>

                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-300 p-2 text-sm rounded hover:bg-gray-50 cursor-pointer transition"
                        >
                            <BsLinkedin aria-hidden="true" className="text-blue-700 text-lg" />
                            <span>Share on LinkedIn <span className="sr-only">(opens in a new tab)</span></span>
                        </a>
                    </section>

                    <CopyLink />
                </div>
            </div>
        </section>
    )
}

export default JobPage
