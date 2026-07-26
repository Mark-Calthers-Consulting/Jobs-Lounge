'use client'
import { useGetSavedJobs, useUser } from '@/hooks/useUsers'
import { useRecommendedJobs } from '@/hooks/useVacancies'
import { Job } from '@/types/types'
import Link from 'next/link'
import { CiBookmark, CiCalendarDate, CiMoneyBill } from 'react-icons/ci'
import { IoCheckmarkCircleOutline, IoLocationOutline } from 'react-icons/io5'
import { FiArrowRight, FiCheck } from 'react-icons/fi'


const DashboardClient: React.FC = () => {
    const userQuery = useUser()
    const userRecommendations = useRecommendedJobs()

    const savedJobsQuery = useGetSavedJobs({
        enabled: !!userQuery.data,
        limit: 1,
    })

    if (userQuery.isLoading) {
        return <p role="status">Loading dashboard…</p>
    }
    if (userQuery.isError) return <p role="alert" className="text-red-700">Unable to load your dashboard.</p>

    const dateJoined = userQuery.data?.createdAt ? new Date(userQuery.data.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }) : ''

    return (
        <div>
            <h1 className='text-3xl font-bold'>Welcome back, {userQuery.data?.name}!</h1>
            <p className='text-gray-600 my-3'>
                Here&apos;s what&apos;s happening with your job search today.
            </p>

            {userQuery.data?.profileCompletion && (
                <section aria-labelledby="dashboard-profile-progress" className="my-5 rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2">
                                <h2 id="dashboard-profile-progress" className="font-semibold text-gray-950">
                                    {userQuery.data.profileCompletion.complete
                                        ? 'Your profile is ready'
                                        : 'Complete your candidate profile'}
                                </h2>
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#184aa2]">
                                    {userQuery.data.profileCompletion.percentage}%
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                                {userQuery.data.profileCompletion.complete
                                    ? 'Recruiters have the essential information they need to review your applications.'
                                    : 'A complete profile gives recruiters useful context when reviewing your applications. You can finish it at your own pace.'}
                            </p>
                            {!userQuery.data.profileCompletion.complete && (
                                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                                    {userQuery.data.profileCompletion.steps.map((step) => (
                                        <li key={step.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                                            <span className={`grid h-4 w-4 place-items-center rounded-full ${step.complete ? 'bg-emerald-100 text-emerald-700' : 'border border-gray-300 text-transparent'}`}>
                                                <FiCheck aria-hidden="true" size={11} />
                                            </span>
                                            {step.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Link
                            href="/dashboard/profile"
                            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#184aa2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123d87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                        >
                            {userQuery.data.profileCompletion.complete ? 'Review profile' : 'Continue profile'}
                            <FiArrowRight aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                        <div className="h-full rounded-full bg-[#184aa2]" style={{ width: `${userQuery.data.profileCompletion.percentage}%` }} />
                    </div>
                </section>
            )}

            {!userQuery.data?.cvLink && (
                <aside className="my-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-amber-950">A CV is required to apply</h2>
                            <p className="mt-1 text-sm text-amber-800">Add a shareable CV link before submitting an application.</p>
                        </div>
                        <Link href="/dashboard/profile" className="text-sm font-semibold text-amber-900 underline underline-offset-4">
                            Add CV link
                        </Link>
                    </div>
                </aside>
            )}


            <Link href='/vacancies' className='my-3 inline-block rounded p-2 shadow'>Go to vacancies</Link>

            <section className='gap-2 grid grid-cols-1 md:grid-cols-3'>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Saved jobs</p>
                        <p className='text-2xl font-semibold'>{savedJobsQuery.data?.pagination.total ?? 0}</p>
                    </div>
                    <CiBookmark aria-hidden="true" size={24} color='#155DFC' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Jobs applied</p>
                        <p className='text-2xl font-semibold'>{userQuery.data?.applicationCount ?? 0}</p>
                    </div>
                    <IoCheckmarkCircleOutline aria-hidden="true" size={24} color='#078536' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Member since</p>
                        <p className='text-2xl font-semibold'>{dateJoined}</p>
                    </div>
                    <CiCalendarDate aria-hidden="true" size={24} color='#7E22CE' />
                </div>
            </section>
            <section>
                <h2 className='text-lg md:text:xl font-semibold my-4'>Recommended Opportunities</h2>
                {userRecommendations.isLoading && <p role="status">Loading recommendations…</p>}
                {userRecommendations.isError && <p role="alert" className="text-red-700">Unable to load recommendations.</p>}
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2  md:grid-cols-3 ">
                    {userRecommendations.data?.map((rec: Job, id: number) => (
                        <div key={id} className='bg-white p-5 rounded ring-1 ring-black/5 shadow flex flex-col gap-2'>
                            <span className='text-xs bg-[#d0d0d098] px-2 py-1 font-semibold rounded w-max'>{rec.jobType}</span>
                            <h3 className='font-bold'>{rec.title}</h3>
                            <p className='text-gray-600 text-sm font-semibold'>{rec.company.name}</p>
                            <p className='flex items-center text-sm text-gray-600'><IoLocationOutline aria-hidden="true" className='mr-2' />{rec.workMode}</p>
                            <p className='flex items-center text-sm text-gray-600'>
                                <CiMoneyBill aria-hidden="true" className='mr-2' />
                                {rec.salary?.min !== undefined || rec.salary?.max !== undefined
                                    ? `${rec.salary?.min ?? '—'} - ${rec.salary?.max ?? '—'}`
                                    : 'Salary not disclosed'}
                            </p>
                            <Link className='w-fit bg-[#184aa2] cursor-pointer hover:bg-[#496698] text-white text-sm px-3 py-2 rounded-sm' href={`/vacancies/${rec._id}`} aria-label={`View details for ${rec.title}`}>View details</Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default DashboardClient
