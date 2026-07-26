import CandidatesGrid from "@/components/CandidatesGrid"
import { Suspense } from "react"

const Candidates: React.FC = () => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Candidates</h1>
                    <p className="my-3 text-gray-600">Manage your candidate database and application history.</p>
                </div>
            </div>

            <div className="">
            <Suspense fallback={<p role="status">Loading candidates…</p>}>
                <CandidatesGrid />
            </Suspense>
            </div>
        </div>
    )
}

export default Candidates
