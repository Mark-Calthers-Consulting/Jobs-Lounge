import DashboardJobsTable from "@/components/DashboardJobsTable"
import DashboardStats from "@/components/DashboardStats"
import JobsTable from "@/components/JobsTable"

const AdminDashboard: React.FC = () => {
    return (
        <div className="">
            <h1 className="font-bold text-2xl">Welcome Back, Admin</h1>
            <p className="my-3 text-[#797979]">Here's what's happening on Jobs Lounge today.</p>
            <DashboardStats />
            <div className="">
                <DashboardJobsTable />
            </div>
        </div>
    )
}

export default AdminDashboard