import ApplicationsPageTable from "@/components/ApplicationsPageTable"
import { BiSearch } from "react-icons/bi"

const AdminApplications: React.FC = () => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Applications</h1>
                    <p className="my-3 text-gray-600">Review and manage candidate applications.</p>
                </div>
                <button type="button">Export CSV</button>
            </div>

            <div className="w-full my-4 ring-1 ring-gray-300 rounded shadow p-2 bg-white">
                <div className="rounded bg-gray-100 relative">
                    <BiSearch aria-hidden="true" className="absolute top-1/2 -translate-y-1/2 left-3" size={18} color="gray" />
                    <label className="sr-only" htmlFor="application-search">Search applications</label>
                    <input id="application-search" type="search" className="rounded ring-1 ring-gray-300 px-10 py-2 w-full" placeholder="Search applications…" />
                </div>
            </div>

            <div className="">
                <ApplicationsPageTable />
            </div>
        </div>
    )
}

export default AdminApplications
