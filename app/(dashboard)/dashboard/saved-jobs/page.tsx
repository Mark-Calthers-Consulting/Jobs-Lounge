'use client'
import JobCard from '@/components/JobCard'
import { useGetSavedJobs } from '@/hooks/useUsers'
import React from 'react'

const SavedJobs = () => {
  const { data, isLoading, error, isError } = useGetSavedJobs({enabled:true})

  if (isLoading) {
    return <h1>Loading</h1>
  }

  console.log(data)
  return (
    <div>
      <h1>Saved Jobs</h1>
      {data.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}

    </div>
  )
}

export default SavedJobs
