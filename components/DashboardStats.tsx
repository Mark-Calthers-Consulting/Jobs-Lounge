'use client'
import { useAdminDashboard } from "@/hooks/useAdmin"
import { useUser } from "@/hooks/useUsers"
import { BsGraphUpArrow } from "react-icons/bs"
import { FaWpforms } from "react-icons/fa"
import { HiOutlineUsers } from "react-icons/hi"
import { PiSuitcase } from "react-icons/pi"

const DashboardStats = () => {
    const { data: dashboardStats, isLoading, isError } = useAdminDashboard()
    const { data: user } = useUser()

    if (isLoading) return <p role="status">Loading dashboard statistics…</p>
    if (isError || !dashboardStats) return <p role="alert" className="text-red-700">Unable to load dashboard statistics.</p>
    return (
        <section className='my-5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5'>
            <div className="flex justify-between rounded bg-white p-5 shadow ring-1 ring-black/5">
                <div>
                    <p>Total jobs</p>
                    <p className="text-2xl font-semibold">{dashboardStats.totalJobs}</p>
                </div>
                <PiSuitcase aria-hidden="true" size={24} color="#155DFC" />
            </div>
            <div className="flex justify-between rounded bg-white p-5 shadow ring-1 ring-black/5">
                <div>
                    <p>Active jobs</p>
                    <p className="text-2xl font-semibold">{dashboardStats.activeJobs}</p>
                </div>
                <BsGraphUpArrow aria-hidden="true" size={24} color="#078536" />
            </div>
            {user?.role !== 'admin' && dashboardStats.totalApplications !== undefined ? (
                <div className="flex justify-between rounded bg-white p-5 shadow ring-1 ring-black/5">
                    <div>
                        <p>Total applications</p>
                        <p className="text-2xl font-semibold">{dashboardStats.totalApplications}</p>
                    </div>
                    <FaWpforms aria-hidden="true" size={24} color="#7E22CE" />
                </div>
            ) : null}
            {user?.role !== 'admin' && dashboardStats.totalCandidates !== undefined ? <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Candidates</p>
                        <p className="font-semibold text-2xl">{dashboardStats.totalCandidates}</p>
                    </div>
                    <HiOutlineUsers aria-hidden="true" size={24} color='#C2410C' />
            </div> : null}
            {user?.role === 'super-admin' && dashboardStats.totalTeamMembers !== undefined ? <div className="rounded bg-white ring-1 ring-black/5 shadow p-5 flex justify-between">
                    <div className="">
                        <p>Team members</p>
                        <p className="font-semibold text-2xl">{dashboardStats.totalTeamMembers}</p>
                    </div>
                    <HiOutlineUsers aria-hidden="true" size={24} color='#184aa2' />
            </div> : null}
        </section>
    )
}

export default DashboardStats
