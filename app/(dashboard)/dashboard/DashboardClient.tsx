'use client'
import { useGetSavedJobs, useUser } from '@/hooks/useUsers'
import { useRecommendedJobs } from '@/hooks/useVacancies'
import { Job } from '@/types/types'
import Link from 'next/link'
import { CiBookmark, CiCalendarDate, CiMoneyBill } from 'react-icons/ci'
import { IoCheckmark, IoCheckmarkCircle, IoCheckmarkCircleOutline, IoLocationOutline } from 'react-icons/io5'


const DashboardClient: React.FC = () => {

    const userQuery = useUser()
    const userRecommendations = useRecommendedJobs()

    const savedJobsQuery = useGetSavedJobs({
        enabled: !!userQuery.data
    })
    if (userQuery.isLoading) {
        return <h1>Loading</h1>
    }
    console.log(userQuery.data)
    console.log(savedJobsQuery?.data?.length)


    if (userQuery.isLoading) {
        return <h1>Loading...</h1>
    }

    if (!userQuery.data) {
        return <h1>No user data found. Please log in.</h1>
    }

    let dateJoined

    dateJoined = userQuery.data ? new Date(userQuery.data?.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }): ''

    return (
        <div>
            <h1 className='text-3xl font-bold'>Welcome back, {userQuery.data?.name}!</h1>
            <p className='text-[#797979] my-3'>Here's what's happening with your job search today. </p>
            <Link href={'/vacancies'}><button className='p-2 rounded shadow my-3'>Go to Vacancies</button></Link>

            {/* <section>
                <div className="ring-1 ring-red-400 p-5 my-4 rounded">
                    <h2>Complete your profile</h2>
                </div>
            </section> */}

            <section className='gap-2 grid grid-cols-1 md:grid-cols-3'>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <h5>Saved Jobs</h5>
                        <p className='text-2xl font-semibold'>{savedJobsQuery?.data?.length}</p>
                    </div>
                    <CiBookmark size={24} color='155DFC' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <h5>Jobs Applied</h5>
                        <p className='text-2xl font-semibold'>{userQuery.data?.applications.length}</p>
                    </div>
                    <IoCheckmarkCircleOutline size={24} color='07A944' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <h5>Member Since</h5>
                        <p className='text-2xl font-semibold'>{dateJoined}</p>
                    </div>
                    <CiCalendarDate size={24}  color='9810FA' />
                </div>
            </section>
            <section>
                <h2 className='text-lg md:text:xl font-semibold my-4'>Recommended Opportunities</h2>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2  md:grid-cols-3 ">
                    {userRecommendations.data?.map((rec: Job, id: number) => (
                        <div key={id} className='bg-white p-5 rounded ring-1 ring-black/5 shadow flex flex-col gap-2'>
                            <span className='text-xs bg-[#d0d0d098] px-2 py-1 font-semibold rounded w-max'>{rec.jobType}</span>
                            <h1 className='font-bold'>{rec.title}</h1>
                            <p className='text-[#797979] text-sm font-semibold'>{rec.company.name}</p>
                            <p className='flex items-center text-sm text-[#797979]'> <IoLocationOutline className='mr-2' />{rec.workMode}</p>
                            <p className='flex items-center text-sm text-[#797979]'><CiMoneyBill className='mr-2' />{rec.salary.min} - {rec.salary.max}</p>
                            <button className='bg-[#184aa2] cursor-pointer hover:bg-[#496698] text-white text-sm px-3 py-2 rounded-sm'>View Details</button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default DashboardClient