'use client'
import JobCard from '@/components/JobCard'
import { useGetSavedJobs } from '@/hooks/useUsers'
import { Job } from '@/types/types'
import React from 'react'

const SavedJobs = () => {
  const { data, isLoading, error, isError } = useGetSavedJobs({ enabled: true })

  if (isLoading) {
    return <h1>Loading</h1>
  }

  console.log(data)
  return (
    <div>
      <h1 className='text-3xl font-bold'>Saved Jobs</h1>
      <p className='text-[#797979] my-3'>Manage your saved jobs and track your applications.</p>

      <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
        {data.map((job: Job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>

    </div>
  )
}

export default SavedJobs
