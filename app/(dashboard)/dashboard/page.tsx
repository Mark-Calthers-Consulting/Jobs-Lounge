'use client'
import { useGetSavedJobs, useUser } from '@/hooks/useUsers'
import Link from 'next/link'
import React from 'react'

const Dashboard: React.FC = () => {
    const { data, isLoading, error, isError } = useUser()
    const { data: savedJobs } = useGetSavedJobs()

    if (isLoading) {
        return <h1>Loading</h1>
    }
    console.log(data)

    return (
        <div>
            <h1 className='text-3xl'>Welcome back, {data.name}!</h1>
            <p>Here's what's happening with your job search today. </p>
            <Link href={'/vacancies'}><button className='p-2 rounded shadow'>Go to Vacancies</button></Link>
            <section className='flex gap-2'>
                <div className="rounded shadow p-5">
                    <h5>Saved Jobs</h5>
                    <p>12</p>
                </div>
                <div className="rounded shadow p-5">
                    <h5>Jobs Applied</h5>
                    <p>12</p>
                </div>
                <div className="rounded shadow p-5">
                    <h5>Saved Jobs</h5>
                    <p>12</p>
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
        </div>
    )
}

export default Dashboard
