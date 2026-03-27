import CandidatesGrid from "@/components/CandidatesGrid"
import ApplicationsPageTable from "@/components/ApplicationsPageTable"
import JobsPageTable from "@/components/JobsPageTable"
import { BiSearch } from "react-icons/bi"

const Candidates: React.FC = () => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Candidates</h1>
                    <p className="my-3 text-[#797979]">Manage your candidate database and application history.</p>
                </div>
                <button>Export CSV</button>
            </div>

            <div className="w-full my-4 ring-1 ring-gray-300 rounded shadow p-2 bg-white">
                <div className="rounded bg-gray-100 relative">
                    <BiSearch className="absolute top-1/2 -translate-y-1/2 left-3" size={18} color="gray" />
                    <input type="text" className="rounded focus:outline-none focus:ring-0 ring-1 ring-gray-300 px-10 py-2 w-full" placeholder="Search Applications..." />
                </div>
            </div>

            <div className="">
                {/* <ApplicationsPageTable /> */}
                <CandidatesGrid />
            </div>
        </div>
    )
}

export default Candidates