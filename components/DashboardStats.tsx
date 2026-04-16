'use client'
import { useAdminDashboard, useAdminUsers, useAdminVacancies } from "@/hooks/useAdmin"
import { useRouter } from "next/navigation"
import { BsGraphUpArrow } from "react-icons/bs"
import { FaWpforms } from "react-icons/fa"
import { HiOutlineUsers } from "react-icons/hi"
import { PiSuitcase } from "react-icons/pi"

const DashboardStats = () => {
    const router = useRouter()
    const { data: dashboardStats, isLoading, error, isError } = useAdminDashboard()
    console.log(dashboardStats)

    // if (!dashboardStats) {
    //     router.replace('/auth')
    // }

    if (isLoading) return <p>Loading...</p>
    return (
        <section className='gap-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 my-5'>
            <>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <h6>Total Jobs</h6>
                        <p className="font-semibold text-2xl">{dashboardStats.totalJobs}</p>
                    </div>
                    <PiSuitcase size={24} color='155DFC' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <h6>Active Jobs</h6>
                        <p className="font-semibold text-2xl">{dashboardStats.activeJobs}</p>
                    </div>
                    <BsGraphUpArrow size={24} color='07A944' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <h6>Total Applications</h6>
                        <p className="font-semibold text-2xl">{dashboardStats.totalApplications}</p>
                    </div>
                    <FaWpforms size={24} color='9810FA' />
                </div>

                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <h6>Total Users</h6>
                        <p className="font-semibold text-2xl">{dashboardStats.totalUsers}</p>
                    </div>
                    <HiOutlineUsers size={24} color='FA7D10' />
                </div>
            </>
        </section>
    )
}

export default DashboardStats