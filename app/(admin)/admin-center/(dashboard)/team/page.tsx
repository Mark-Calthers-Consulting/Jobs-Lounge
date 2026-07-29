import TeamPageTable from "@/components/TeamPageTable"

const AdminUsers: React.FC = () => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Team</h1>
                    <p className="my-3 text-gray-600">Create staff accounts and manage recruitment permissions.</p>
                </div>
            </div>

            <div className="">
                <TeamPageTable />
            </div>
        </div>
    )
}

export default AdminUsers
