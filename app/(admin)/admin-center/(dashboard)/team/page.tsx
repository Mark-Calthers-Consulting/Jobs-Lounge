import TeamPageTable from "@/components/TeamPageTable"

const AdminUsers: React.FC = () => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Users</h1>
                    <p className="my-3 text-gray-600">Manage and view team members and users.</p>
                </div>
            </div>

            <div className="">
                <TeamPageTable />
            </div>
        </div>
    )
}

export default AdminUsers
