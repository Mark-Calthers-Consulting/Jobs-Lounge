export type Job = {
  _id: string
  title: string
  description: string
  location: string
  jobType: string
  level: string

  company: {
    name: string
    logo: string
    website: string
  }

  salary: {
    min: number
    max: number
    currency: string
  }

  postedBy: {
    id: string
    name: string
  }

  responsibilities: string[] 
  benefits:string[]
  requirements: string[]

  applyLink: string
  deadline: string // ISO date string
  status: string
  views: number

  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  __v: number
}