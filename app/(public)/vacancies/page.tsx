'use client'
import { useEffect, useState } from "react"
import type { Job } from "@/types/types"
import Link from "next/link"
import JobFilters from "@/components/JobFilters"

const Vacancies: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const getAllJobs = async () => {
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`)
    const vacancies = await data.json()
    setJobs(vacancies.data)
    console.log(vacancies)
  }

  useEffect(() => {
    getAllJobs()
  }, [])
  return (
    <div>
      <section className="px-12 py-4 mb-8 bg-[#607E98] flex items-center justify-between">
        <p className="text-white">Find Jobs</p>
        <input type="text" className="bg-white rounded px-4 py-2 outline-none" placeholder="Search Jobs" />
        <p className="text-white">Home <span className="fontbo">/ Vacancies</span></p>
      </section>
      <section className="flex px-12 gap-4 mb-6">
        <section>
          <JobFilters />
        </section>
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 content-start">
          {jobs.map((job: Job, id) => (
            <Link key={job._id} href={`${process.env.NEXT_PUBLIC_ORIGIN}/vacancies/${job._id}`}>
              <div className="shadow p-5 rounded cursor-pointer">
                <p className="text-[#959595] text-sm">{job.company.name}</p>
                <h3 className="font-semibold ">{job.title}</h3>
                <p>{job.location}</p>
                <p>{job.jobType}</p>
                <p>{job.level}</p>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </div>
  )
}

export default Vacancies
