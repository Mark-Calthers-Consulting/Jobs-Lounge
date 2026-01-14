import { FaFacebook } from 'react-icons/fa'
import type { Job } from '../../../../types/types'
import CopyLink from '../../../../components/CopyLink'
import { FaLocationDot, FaXTwitter } from "react-icons/fa6";
import { MdOutlineWorkOutline, MdWorkspacePremium } from "react-icons/md";
import { BsLinkedin } from "react-icons/bs";

type JobPageProps = {
    params: Promise<{
        jobId: string
    }>
}

const getSingleJob = async (id: string): Promise<Job> => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${id}`,
        { cache: 'no-store' }
    )

    if (!res.ok) {
        throw new Error('Failed to fetch job')
    }

    const data = await res.json()
    console.log(data)
    return data.data
}

const JobPage = async ({ params }: JobPageProps) => {
    const { jobId } = await params
    const job = await getSingleJob(jobId)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const currentUrl = `${baseUrl}/jobs/${jobId}`;
    const encodedUrl = encodeURIComponent(currentUrl);

    return (
        <section>
            <section className='bg-[#333] h-24 w-full' />

            <section className='flex pt-8 px-12 border'>
                <div className="">
                    <section className=''>
                        <h1 className='text-4xl font-bold'>{job.title}</h1>

                        <h3 className='text-2xl'>{job.company.name}</h3>

                        <div className="">
                            <h3 className='font-semibold my-3'>Description</h3>
                            <p className='w-8/12'>{job.description}</p>
                        </div>

                        <div className="my-8">
                            <h3 className='font-semibold my-3'>Responsibilities</h3>
                            <ul className='list-none pl-5 space-y-3 '>
                                {job.responsibilities.map((responsibility, index) => (
                                    <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>{responsibility}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="my-8">
                            <h3 className='font-semibold my-3'>Benefits</h3>
                            <ul className='list-none pl-5 space-y-3 '>
                                {job.benefits.map((benefit, index) => (
                                    <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="my-8">
                            <h3 className='font-semibold my-3'>Requirements</h3>
                            <ul className='list-none pl-5 space-y-3 '>
                                {job.requirements.map((requirement, index) => (
                                    <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>{requirement}</li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
                <div className="flex-1">
                    <section className='shadow rounded p-4 space-y-2 text-sm'>
                        <h5 className='text-center'>Job Overview</h5>
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

                    </section>

                    <section className='my-5 space-y-2'>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-300 p-2 text-sm rounded hover:bg-gray-50 cursor-pointer transition"
                        >
                            <FaFacebook className="text-blue-600 text-lg" />
                            <p>Share on Facebook</p>
                        </a>

                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`Check out this ${job.title} role at ${job.company.name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-300 p-2 text-sm rounded hover:bg-gray-50 cursor-pointer transition"
                        >
                            <FaXTwitter className="text-black text-lg" />
                            <p>Share on X</p>
                        </a>

                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-300 p-2 text-sm rounded hover:bg-gray-50 cursor-pointer transition"
                        >
                            <BsLinkedin className="text-blue-700 text-lg" />
                            <p>Share on LinkedIn</p>
                        </a>
                    </section>

                    <CopyLink />
                </div>
            </section>
        </section>
    )
}

export default JobPage
