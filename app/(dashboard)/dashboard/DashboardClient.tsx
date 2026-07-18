'use client'
import { useGetSavedJobs, useUser } from '@/hooks/useUsers'
import { useRecommendedJobs } from '@/hooks/useVacancies'
import { Job } from '@/types/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CiBookmark, CiCalendarDate, CiMoneyBill } from 'react-icons/ci'
import { IoCheckmarkCircleOutline, IoLocationOutline } from 'react-icons/io5'


const DashboardClient: React.FC = () => {
    const router = useRouter()
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

            {!userQuery.data?.cvLink && (
                <div className="my-4 rounded bg-amber-50 px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-amber-900">
                                Add your CV link before applying
                            </h3>
                            <p className="mt-1 text-sm text-amber-800">
                                Update your profile with your CV link to unlock job applications.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/profile')}
                            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                        >
                            Add CV Link
                        </button>
                    </div>
                </div>
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
