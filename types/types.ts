import type {
  ApplicationStatus,
  BlogStatus,
  Category,
  JobStatus,
  JobType,
  Level,
  UserGender,
  UserMaritalStatus,
  UserNyscStatus,
  UserRole,
  WorkMode,
} from '@/constants/enums'

export type Job = {
  _id: string
  title: string
  description: string
  category: Category
  location: string
  workMode: WorkMode
  jobType: JobType
  level: Level
  company: {
    name: string
    logo?: string
    website?: string
  }
  salary?: {
    min?: number
    max?: number
    currency: string
  }
  postedBy?: {
    id: string
    name: string
  }
  responsibilities: string[]
  benefits: string[]
  requirements: string[]
  skills: string[]
  experience: number
  applyLink?: string
  deadline?: string
  status: JobStatus
  views: number
  totalApplicants?: number
  createdAt: string
  updatedAt: string
  __v?: number
}

export type User = {
  _id: string
  name?: string
  firstName?: string
  middleName?: string
  lastName?: string
  otherName?: string
  gender?: UserGender
  dob?: string
  maritalStatus?: UserMaritalStatus
  email: string
  telephone: string
  whatsapp?: string
  residentialAddress?: string
  applicationCount?: number
  role: UserRole
  lastLogin?: {
    at?: string
    ip?: string
    device?: string
  }
  profileCompleted: boolean
  profileCompletion?: ProfileCompletion
  highestEducation?: string
  yearCompletedNysc?: number
  nyscStatus?: UserNyscStatus
  postNyscExperience?: number
  cvLink?: string
  coverLetterLink?: string
  notificationPreferences?: NotificationPreferences
  createdAt: string
  updatedAt: string
}

export type ProfileCompletionStep = {
  id: 'identity' | 'education' | 'experience' | 'cv'
  label: string
  complete: boolean
  missingFields: string[]
}

export type ProfileCompletion = {
  complete: boolean
  completedSteps: number
  totalSteps: number
  percentage: number
  missingFields: string[]
  steps: ProfileCompletionStep[]
}

export type AuthUser = Pick<User, '_id' | 'name' | 'email' | 'role'>

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = LoginPayload & {
  firstName: string
  lastName: string
  telephone: string
}

export type PasswordResetRequestPayload = {
  email: string
}

export type PasswordResetConfirmPayload = {
  token: string
  password: string
}

type EditableUserProfile = Pick<User,
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'otherName'
  | 'gender'
  | 'dob'
  | 'maritalStatus'
  | 'telephone'
  | 'whatsapp'
  | 'residentialAddress'
  | 'highestEducation'
  | 'yearCompletedNysc'
  | 'nyscStatus'
  | 'postNyscExperience'
  | 'cvLink'
  | 'coverLetterLink'
>

export type UserUpdatePayload = {
  [Field in keyof EditableUserProfile]?: EditableUserProfile[Field] | null
}

export type JobPageProps = {
  params: Promise<{ jobId: string }>
}

export type BlogPageProps = {
  params: Promise<{ slug: string }>
}

export type ApplyPayload = {
  jobId: string
  cvLink: string
  coverLetterLink?: string
  note?: string
}

export type NotificationPreferences = {
  jobAlerts: boolean
  newsletter: boolean
}

export type ApplicationRecord = {
  _id: string
  job: string | Partial<Pick<Job, '_id' | 'title' | 'company'>>
  applicant: string | Partial<Pick<User, '_id' | 'name' | 'firstName' | 'lastName' | 'email'>>
  status: ApplicationStatus
  cvLink: string
  coverLetterLink?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type JobApplication = {
  _id: string
  job: Pick<Job, '_id' | 'title' | 'company' | 'location' | 'workMode' | 'jobType' | 'status' | 'deadline'> | null
  applicant?: Pick<User, '_id' | 'name' | 'firstName' | 'middleName' | 'lastName' | 'email' | 'telephone' | 'cvLink' | 'coverLetterLink'> | null
  status: ApplicationStatus
  cvLink?: string
  coverLetterLink?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type PaginationMetadata = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type ApiSuccess<T> = {
  status: 'success'
  data: T
  message?: string
}

export type PaginatedResponse<T> = {
  status: 'success'
  count: number
  data: T[]
  pagination: PaginationMetadata
}

export type PageOptions = {
  page?: number
  limit?: number
}

export type AdminApplication = {
  applicationId: string
  applicantId: string
  name: string
  email: string
  telephone?: string
  jobId: string
  title: string
  createdAt: string
  status: ApplicationStatus
  cvLink?: string
  coverLetterLink?: string
  note?: string
}

export type CandidateSummary = {
  _id: string
  name?: string
  email: string
  telephone: string
  highestEducation?: string
  postNyscExperience?: number
  profileCompleted: boolean
  applicationCount: number
  latestApplicationAt?: string
  createdAt: string
  updatedAt: string
}

export type CandidateListFilters = {
  page?: number
  limit?: number
  search?: string
  profileCompleted?: boolean
  applicationStatus?: ApplicationStatus
  jobId?: string
  education?: string
  experienceMin?: number
  experienceMax?: number
  joinedFrom?: string
  joinedTo?: string
  sort?: 'newest' | 'oldest' | 'name' | 'applications'
}

export type CandidateFilterOptions = {
  educationLevels: string[]
  jobs: Array<{
    _id: string
    title: string
    company?: string
  }>
}

export type AdminCandidateDetail = {
  candidate: Omit<User, 'role' | 'lastLogin' | 'notificationPreferences'> & {
    profileCompletion: ProfileCompletion
  }
  applicationSummary: {
    total: number
    byStatus: Record<ApplicationStatus, number>
    latestApplicationAt?: string
  }
}

export type CandidateApplication = {
  _id: string
  job: Pick<Job, '_id' | 'title' | 'company' | 'status'> | null
  status: ApplicationStatus
  cvLink?: string
  coverLetterLink?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type DashboardStats = {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  totalUsers: number
}

export type SavedJobMutation = {
  jobId: string
  saved: boolean
}

export type BlogPost = {
  _id: string
  title: string
  slug: string
  content: string
  status: BlogStatus
  postedBy: { name: string }
  createdAt: string
  updatedAt: string
  __v?: number
}

export type CreateBlogPostPayload = Pick<BlogPost, 'title' | 'slug' | 'content'> & {
  status?: BlogStatus
}

export type JobApplicationsResponse = PaginatedResponse<JobApplication> & {
  job: Pick<Job, '_id' | 'title'>
}
