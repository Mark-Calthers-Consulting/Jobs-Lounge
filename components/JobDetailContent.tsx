import type { ReactNode } from 'react'
import { FaLocationDot } from 'react-icons/fa6'
import { MdOutlineWorkOutline, MdWorkspacePremium } from 'react-icons/md'

import type { Job } from '@/types/types'
import { formatJobDeadline, isJobDeadlinePast } from '@/utils/jobDeadline'

type JobDetailContentProps = {
    job: Job
    sidebarContent?: ReactNode
}

const JobDetailContent = ({ job, sidebarContent }: JobDetailContentProps) => {
    const deadlinePassed = isJobDeadlinePast(job)

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-8 md:flex-row md:px-12">
            <div className="min-w-0 flex-1">
                <section>
                    <h1 className="break-words text-4xl font-bold">{job.title}</h1>
                    <h2 className="mt-1 text-2xl">{job.company.name}</h2>

                    <div>
                        <h2 className="my-3 font-semibold">Description</h2>
                        <p className="max-w-3xl whitespace-pre-wrap">{job.description}</p>
                    </div>

                    <div className="my-8">
                        <h2 className="my-3 font-semibold">Responsibilities</h2>
                        <ul className="list-disc space-y-3 pl-5">
                            {job.responsibilities.map((responsibility, index) => (
                                <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>
                                    {responsibility}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="my-8">
                        <h2 className="my-3 font-semibold">Benefits</h2>
                        <ul className="list-disc space-y-3 pl-5">
                            {job.benefits.map((benefit, index) => (
                                <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="my-8">
                        <h2 className="my-3 font-semibold">Requirements</h2>
                        <ul className="list-disc space-y-3 pl-5">
                            {job.requirements.map((requirement, index) => (
                                <li className="border-l-3 border-gray-400 pl-4 text-gray-600" key={index}>
                                    {requirement}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>

            <aside className="w-full shrink-0 md:w-72">
                <section className="space-y-2 rounded p-4 text-sm shadow">
                    <h2 className="text-center font-semibold">Job overview</h2>
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
                    {!deadlinePassed ? (
                        <div>
                            <span className="text-gray-600">Application deadline:</span>{' '}
                            {job.deadline ? formatJobDeadline(job.deadline) : 'No deadline'}
                        </div>
                    ) : null}
                </section>

                {sidebarContent}
            </aside>
        </div>
    )
}

export default JobDetailContent
