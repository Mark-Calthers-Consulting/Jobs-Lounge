import JobsTable from "@/components/JobsTable"

const AdminPanel: React.FC = () => {
    return (
        <div className="">
            <div className="">Welcome Back, Admin</div>
            <p>Here's what's happening on Jobs Lounge today.</p>
            <div className="flex">
                <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                    <h6>Total Jobs</h6>
                    <p className="font-semibold text-2xl">5</p>
                </div>
                <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                    <h6>Active Jobs</h6>
                    <p className="font-semibold text-2xl">5</p>
                </div>
                <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                    <h6>Total Applications</h6>
                    <p className="font-semibold text-2xl">5</p>
                </div>
                <div className="p-5 ring-1 ring-gray-200 rounded shadow">
                    <h6>Total Users</h6>
                    <p className="font-semibold text-2xl">5</p>
                </div>
            </div>
            <div className="">
                <JobsTable />
            </div>
        </div>
    )
}

export default AdminPanel