'use client'
import { useAdminDashboard } from "@/hooks/useAdmin"
import { BsGraphUpArrow } from "react-icons/bs"
import { FaWpforms } from "react-icons/fa"
import { HiOutlineUsers } from "react-icons/hi"
import { PiSuitcase } from "react-icons/pi"

const DashboardStats = () => {
    const { data: dashboardStats, isLoading, isError } = useAdminDashboard()

    if (isLoading) return <p role="status">Loading dashboard statistics…</p>
    if (isError || !dashboardStats) return <p role="alert" className="text-red-700">Unable to load dashboard statistics.</p>
    return (
        <section className='gap-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 my-5'>
            <>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Total jobs</p>
                        <p className="font-semibold text-2xl">{dashboardStats.totalJobs}</p>
                    </div>
                    <PiSuitcase aria-hidden="true" size={24} color='#155DFC' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Active jobs</p>
                        <p className="font-semibold text-2xl">{dashboardStats.activeJobs}</p>
                    </div>
                    <BsGraphUpArrow aria-hidden="true" size={24} color='#078536' />
                </div>
                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Total applications</p>
                        <p className="font-semibold text-2xl">{dashboardStats.totalApplications}</p>
                    </div>
                    <FaWpforms aria-hidden="true" size={24} color='#7E22CE' />
                </div>

                <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Total users</p>
                        <p className="font-semibold text-2xl">{dashboardStats.totalUsers}</p>
                    </div>
                    <HiOutlineUsers aria-hidden="true" size={24} color='#C2410C' />
                </div>
            </>
        </section>
    )
}

export default DashboardStats
