import ApplicationsPageTable from "@/components/ApplicationsPageTable"

const AdminApplications: React.FC = () => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Applications</h1>
                    <p className="my-3 text-gray-600">Review and manage candidate applications.</p>
                </div>
            </div>

            <div className="">
                <ApplicationsPageTable />
            </div>
        </div>
    )
}

export default AdminApplications
