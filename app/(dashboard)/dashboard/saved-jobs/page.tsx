'use client'
import JobCard from '@/components/JobCard'
import { useGetSavedJobs } from '@/hooks/useUsers'
import { Job } from '@/types/types'
import React from 'react'
import { useState } from 'react'
import PaginationControls from '@/components/PaginationControls'

const SavedJobs = () => {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetSavedJobs({ enabled: true, page })

  if (isLoading) {
    return <h1>Loading</h1>
  }

  return (
    <div>
      <h1 className='text-3xl font-bold'>Saved Jobs</h1>
      <p className='text-[#797979] my-3'>Manage your saved jobs and track your applications.</p>

      <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
        {data && data.data.length > 0
          ?
          data.data.map((job: Job) => (
            <JobCard key={job._id} job={job} />
          ))

          : <p className='text-[#797979]'>No saved jobs yet...</p>
        }
      </div>
      <PaginationControls pagination={data?.pagination} onPageChange={setPage} />

    </div>
  )
}

export default SavedJobs
