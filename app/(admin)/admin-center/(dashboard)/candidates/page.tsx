import CandidatesGrid from "@/components/CandidatesGrid"
import { BiSearch } from "react-icons/bi"

const Candidates: React.FC = () => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Candidates</h1>
                    <p className="my-3 text-gray-600">Manage your candidate database and application history.</p>
                </div>
                <button type="button">Export CSV</button>
            </div>

            <div className="w-full my-4 ring-1 ring-gray-300 rounded shadow p-2 bg-white">
                <div className="rounded bg-gray-100 relative">
                    <BiSearch aria-hidden="true" className="absolute top-1/2 -translate-y-1/2 left-3" size={18} color="gray" />
                    <label className="sr-only" htmlFor="candidate-search">Search candidates</label>
                    <input id="candidate-search" type="search" className="rounded ring-1 ring-gray-300 px-10 py-2 w-full" placeholder="Search candidates…" />
                </div>
            </div>

            <div className="">
                <CandidatesGrid />
            </div>
        </div>
    )
}

export default Candidates
