'use client'
import JobsPageTable from '@/components/JobsPageTable'
import { useRouter } from 'next/navigation'
import { BiSearch } from 'react-icons/bi'

const JobsClient = () => {
    const router = useRouter()
    return (
        <>
            <div className="">
                <div className="">
                    <h1 className="font-bold text-2xl">Jobs</h1>
                    <p className="my-3 text-[#797979]">Manage your job listings and applications.</p>
                </div>
                <button className='text-white bg-[#333] text-sm px-2 py-1 rounded-sm cursor-pointer' onClick={() => router.push('jobs/create')}>Create Job</button>
            </div>

            <div className="w-full my-4 ring-1 ring-gray-300 rounded shadow p-2 bg-white">
                <div className="rounded bg-gray-100 relative">
                    <BiSearch className="absolute top-1/2 -translate-y-1/2 left-3" size={18} color="gray" />
                    <input type="text" className="rounded focus:outline-none focus:ring-0 ring-1 ring-gray-300 px-10 py-2 w-full" placeholder="Search jobs..." />
                </div>
            </div>

            <div className="">
                <JobsPageTable />
            </div>
        </>
    )
}

export default JobsClient