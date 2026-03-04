'use client'
import { useAdminDashboard, useAdminUsers, useAdminVacancies } from "@/hooks/useAdmin"

const DashboardStats = () => {

    const { data: dashboardStats, isLoading, error, isError } = useAdminDashboard()
    console.log(dashboardStats)

    if(isLoading) return <p>Loading...</p>
    return (
        <div className="flex">
            <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                <h6>Total Jobs</h6>
                <p className="font-semibold text-2xl">{dashboardStats.totalJobs}</p>
            </div>
            <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                <h6>Active Jobs</h6>
                <p className="font-semibold text-2xl">{dashboardStats.totalUsers}</p>
            </div>
            <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                <h6>Total Applications</h6>
                <p className="font-semibold text-2xl">TBD</p>
            </div>
            <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                <h6>Total Users</h6>
                <p className="font-semibold text-2xl">{dashboardStats.totalUsers}</p>
            </div>
        </div>
    )
}

export default DashboardStats