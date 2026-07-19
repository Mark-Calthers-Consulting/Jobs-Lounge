'use client'
import JobsPageTable from '@/components/JobsPageTable'
import { useRouter } from 'next/navigation'

const JobsClient = () => {
    const router = useRouter()
    return (
        <>
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Jobs</h1>
                    <p className="my-3 text-gray-600">Manage your job listings and applications.</p>
                </div>
                <button type="button" className='text-white bg-[#333] text-sm px-2 py-1 rounded-sm cursor-pointer' onClick={() => router.push('jobs/create')}>Create job</button>
            </div>

            <div className="">
                <JobsPageTable />
            </div>
        </>
    )
}

export default JobsClient
