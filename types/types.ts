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
  archivedAt?: string
  applicationSummary?: {
    total: number
    byStatus: Record<ApplicationStatus, number>
  }
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
  emailVerified: boolean
  emailVerifiedAt?: string
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

export type AuthUser = Pick<User, '_id' | 'name' | 'email' | 'emailVerified' | 'role'>

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

export type EmailVerificationConfirmPayload = {
  token: string
}

export type EmailVerificationResult = {
  emailVerified: true
  emailVerifiedAt: string
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

export type VacancySort = 'newest' | 'oldest'
export type VacancyDatePosted = '24h' | '7d' | '30d'

export type VacancyFilters = {
  page?: number
  limit?: number
  search?: string
  category?: Category[]
  workMode?: WorkMode[]
  jobType?: JobType[]
  level?: Level[]
  location?: string[]
  datePosted?: VacancyDatePosted
  experienceMin?: number
  experienceMax?: number
  salaryMin?: number
  salaryDisclosed?: boolean
  sort?: VacancySort
}

export type JobFilterOption = {
  value: string
  count: number
}

export type JobFilterOptions = {
  categories: JobFilterOption[]
  workModes: JobFilterOption[]
  jobTypes: JobFilterOption[]
  levels: JobFilterOption[]
  locations: JobFilterOption[]
}

export type AdminApplication = {
  applicationId: string
  applicantId: string
  name: string
  email: string
  telephone?: string
  jobId: string
  title: string
  jobStatus?: JobStatus
  jobArchivedAt?: string
  createdAt: string
  status: ApplicationStatus
  cvLink?: string
  coverLetterLink?: string
  note?: string
}

export type AdminJobView = 'all' | 'open' | 'draft' | 'closed' | 'deadline-passed' | 'archived'
export type AdminJobSort = 'newest' | 'oldest' | 'deadline' | 'applicants'

export type AdminJobListFilters = {
  page?: number
  limit?: number
  search?: string
  view?: AdminJobView
  sort?: AdminJobSort
}

export type AdminJobSummary = {
  all: number
  open: number
  draft: number
  closed: number
  deadlinePassed: number
  archived: number
}

export type AdminJobsResponse = PaginatedResponse<Job> & {
  summary: AdminJobSummary
}

export type AdminApplicationListFilters = {
  page?: number
  limit?: number
  jobId?: string
  status?: ApplicationStatus
}

export type AdminApplicationsResponse = PaginatedResponse<AdminApplication> & {
  filterContext: {
    status: ApplicationStatus | null
    job: {
      _id: string
      title: string
      company?: string
      status: JobStatus
      archivedAt?: string
    } | null
  }
}

export type CandidateSummary = {
  _id: string
  name?: string
  email: string
  telephone: string
  highestEducation?: string
  postNyscExperience?: number
  profileCompleted: boolean
  profileCompletion: {
    complete: boolean
    percentage: number
    missingSectionCount: number
  }
  duplicateSignal: {
    possibleDuplicate: boolean
    matchFields: Array<'email' | 'telephone'>
  }
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
  sort?: 'newest' | 'oldest' | 'name' | 'name-desc' | 'applications' | 'applications-asc'
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
  duplicateSignal: {
    possibleDuplicate: boolean
    matchFields: Array<'email' | 'telephone'>
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
