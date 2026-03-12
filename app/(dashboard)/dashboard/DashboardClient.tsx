'use client'
import { useGetSavedJobs, useUser } from '@/hooks/useUsers'
import Link from 'next/link'


const DashboardClient: React.FC = () => {

    const userQuery = useUser()
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


    return (
        <div>
            <h1 className='text-3xl'>Welcome back, {userQuery.data?.name}!</h1>
            <p>Here's what's happening with your job search today. </p>
            <Link href={'/vacancies'}><button className='p-2 rounded shadow'>Go to Vacancies</button></Link>

            <section>
                <div className="ring-1 ring-red-400 p-5 my-4 rounded">
                    <h2>Complete your profile</h2>
                </div>
            </section>

            <section className='flex gap-2 grid grid-cols-1 md:grid-cols-3'>
                <div className="rounded bg-white shadow p-5">
                    <h5>Saved Jobs</h5>
                    <p className='text-2xl font-semibold'>{savedJobsQuery?.data?.length}</p>
                </div>
                <div className="rounded bg-white shadow p-5">
                    <h5>Jobs Applied</h5>
                    <p className='text-2xl font-semibold'>12</p>
                </div>
                <div className="rounded bg-white shadow p-5">
                    <h5>Saved Jobs</h5>
                    <p className='text-2xl font-semibold'>12</p>
                </div>
            </section>
            <section>
                <h2>Recommended Opportunities</h2>
                <div className="">
                    <div className="">
                        <p></p>
                        <h3>Senior Project Manager</h3>
                    </div>
                    <div className="">
                        <p></p>
                        <h3>Senior Project Manager</h3>
                    </div>
                    <div className="">
                        <p></p>
                        <h3>Senior Project Manager</h3>
                    </div>
                </div>
            </section>
            <section>
                <h2>Recommended Opportunities</h2>
                <div className="">

                </div>
            </section>
        </div>
    )
}

export default DashboardClient