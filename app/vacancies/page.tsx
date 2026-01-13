'use client'
import { useEffect, useState } from "react"
import type { Job } from "@/types/types"
import Link from "next/link"

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
      <section>
        <h1>Vacancies</h1>

        <section className="flex">
          {jobs.map((job: Job, id) => (
            <Link key={job._id} href={`${process.env.NEXT_PUBLIC_ORIGIN}/vacancies/${job._id}`}>
              <div  className="shadow p-5 rounded cursor-pointer">
                <h3>{job.title}</h3>
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
