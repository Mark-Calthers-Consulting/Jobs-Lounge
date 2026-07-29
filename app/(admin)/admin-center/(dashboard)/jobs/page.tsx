import JobsClient from "./JobsClient"
import { Suspense } from "react"

const AdminJobs: React.FC = () => {
    return (
        <div className="">
            <Suspense fallback={<p role="status">Loading jobs…</p>}>
                <JobsClient />
            </Suspense>
        </div>
    )
}

export default AdminJobs
