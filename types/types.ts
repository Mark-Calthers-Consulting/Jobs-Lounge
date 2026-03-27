export type Job = {
  _id: string
  title: string
  description: string
  category: string
  location: string
  workMode: string
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
  benefits: string[]
  requirements: string[]
  experience: number

  applyLink: string
  deadline: string // ISO date string
  status: string
  views: number

  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  __v: number
}

export type User = {
  _id?: string

  // Basic info
  name?: string
  surname?: string
  middleName?: string
  lastName?: string
  gender?: 'male' | 'female' | 'other'
  dob?: Date
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'

  // Contact info
  email?: string
  telephone?: string
  whatsapp?: string

  // Address
  residentialAddress?: string

  // Auth
  password?: string

  // Activity
  applications?: string[] // ObjectId as string
  savedJobs?: string[]
  role?: 'user' | 'admin' | 'super-admin'

  lastLogin?: {
    at?: Date
    ip?: string
    device?: string
  }

  // Profile
  profileCompleted?: boolean

  // Education
  highestEducation?: string
  yearCompletedNysc?: number
  nyscStatus?: 'completed' | 'exempted' | 'not-started'
  postNyscExperience?: number

  // Files
  cvLink?: string
  coverLetterLink?: string

  // Timestamps
  createdAt?: Date
  updatedAt?: Date
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
  name?: string
}

export type JobPageProps = {
  params: Promise<{
    jobId: string
  }>
}

export type applyPayload = {
  jobId: string
}