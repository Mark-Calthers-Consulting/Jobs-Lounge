import DashboardJobsTable from "@/components/DashboardJobsTable"
import DashboardStats from "@/components/DashboardStats"
import AdminAccessNotice from "@/components/AdminAccessNotice"
import { Suspense } from "react"

const AdminDashboard: React.FC = () => {
    return (
        <div className="">
            <Suspense fallback={null}><AdminAccessNotice /></Suspense>
            <h1 className="font-bold text-2xl">Welcome back</h1>
            <p className="my-3 text-gray-600">Here&apos;s what&apos;s happening on Jobs Lounge today.</p>
            <DashboardStats />
            <div className="">
                <DashboardJobsTable />
            </div>
        </div>
    )
}

export default AdminDashboard
