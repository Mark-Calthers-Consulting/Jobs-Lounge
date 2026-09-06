import type {
  ApplicationStatus,
  BlogCategory,
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
  lastEditedBy?: {
    id: string
    name: string
    at: string
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
    byStatus?: Record<ApplicationStatus, number>
  }
  createdAt: string
  updatedAt: string
  __v?: number
}

export type RecommendedJob = Job & {
  recommendation: {
    kind: 'category-match' | 'recent-fallback'
    reason: string
  }
}

export type CandidateOnboardingStatus = 'not-started' | 'in-progress' | 'snoozed' | 'completed'

export type AcquisitionSource =
  | 'search'
  | 'linkedin'
  | 'other-social-media'
  | 'referral'
  | 'school-community'
  | 'event'
  | 'employer'
  | 'mark-calthers-network'
  | 'other'
  | 'prefer-not-to-say'

export type CandidateOnboarding = {
  questionnaire: {
    questionnaireStatus: CandidateOnboardingStatus
    currentStep: 1 | 2
    questionnaireVersion: number
    interests: {
      categories: Category[]
      openToAny: boolean
    }
    acquisition: {
      source?: AcquisitionSource
      detail?: string
      respondedAt?: string
    }
    startedAt: string | null
    snoozedAt: string | null
    completedAt: string | null
  }
  checklist: {
    collapsed: boolean
    complete: boolean
    completedCount: number
    totalCount: number
    items: Array<{
      id: 'personalize' | 'verify-email' | 'complete-profile'
      label: string
      complete: boolean
      percentage?: number
    }>
  }
}

export type OnboardingInterestsPayload = {
  categories: Category[]
  openToAny: boolean
}

export type OnboardingAcquisitionPayload = {
  source: AcquisitionSource
  detail?: string
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

export type PasswordChangePayload = {
  currentPassword: string
  newPassword: string
}

export type StaffInvitationConfirmPayload = {
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

export type ApplicationSubmission = {
  applicationId: string
  jobId: string
  submittedAt: string
}

export type JobApplication = {
  _id: string
  job: Pick<Job, '_id' | 'title' | 'company' | 'location' | 'workMode' | 'jobType' | 'status' | 'deadline'> | null
  applicant?: Pick<User, '_id' | 'name' | 'firstName' | 'middleName' | 'lastName' | 'email' | 'telephone' | 'cvLink' | 'coverLetterLink'> | null
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
  priority: boolean
  workflowVersion: number
  statusUpdatedAt?: string
  highestEducation?: string
  nyscStatus?: UserNyscStatus
  yearCompletedNysc?: number
  postNyscExperience?: number
  profileCompleted?: boolean
  cvLink?: string
  coverLetterLink?: string
  note?: string
}

export type ApplicationWorkspaceSort =
  | 'newest'
  | 'oldest'
  | 'name'
  | 'experience-desc'
  | 'experience-asc'
  | 'priority'
  | 'updated'

export type ApplicationWorkspaceFilters = {
  cursor?: string
  limit?: number
  jobId?: string
  applicantId?: string
  status?: ApplicationStatus[]
  priority?: boolean
  education?: string
  nyscStatus?: UserNyscStatus
  experienceMin?: number
  experienceMax?: number
  profileCompleted?: boolean
  appliedFrom?: string
  appliedTo?: string
  hasCv?: boolean
  hasCoverLetter?: boolean
  sort?: ApplicationWorkspaceSort
}

export type ApplicationStageTotals = Record<ApplicationStatus, number>

export type CursorResponse<T> = {
  status: 'success'
  count: number
  data: T[]
  pageInfo: {
    nextCursor: string | null
    hasNextPage: boolean
  }
}

export type ApplicationListResponse = CursorResponse<AdminApplication> & {
  stageTotals: ApplicationStageTotals
}

export type ApplicationWorkload = {
  jobId: string
  title: string
  company?: string
  jobStatus?: JobStatus
  archivedAt?: string
  total: number
  latestApplicationAt?: string
  byStatus: ApplicationStageTotals
}

export type ApplicationOverview = {
  totals: ApplicationStageTotals
  vacancyWorkloads: ApplicationWorkload[]
  recentApplications: AdminApplication[]
}

export type ApplicationJobDirectoryFilters = {
  page?: number
  limit?: number
  search?: string
  view?: 'all' | 'open' | 'draft' | 'closed' | 'archived'
  sort?: 'newest-application' | 'applications' | 'new' | 'name'
}

export type ApplicationJobDirectoryResponse = PaginatedResponse<ApplicationWorkload>

export type ApplicationJobSummary = {
  job: {
    _id: string
    title: string
    company?: string
    status: JobStatus
    archivedAt?: string
  }
  total: number
  byStatus: ApplicationStageTotals
}

export type ApplicationDetail = {
  application: {
    applicationId: string
    applicantId: string
    jobId: string
    status: ApplicationStatus
    priority: boolean
    workflowVersion: number
    statusUpdatedAt?: string
    cvLink?: string
    coverLetterLink?: string
    note?: string
    candidateSnapshot?: Partial<User>
    createdAt: string
    updatedAt: string
  }
  job: Partial<Job> | null
  candidate: (Omit<User, 'role' | 'lastLogin' | 'notificationPreferences'> & {
    profileCompletion: ProfileCompletion
  }) | null
  duplicateSignal: {
    possibleDuplicate: boolean
    matchFields: Array<'email' | 'telephone'>
  }
}

export type ApplicationActivity = {
  _id: string
  type: 'submitted' | 'status_changed' | 'priority_changed' | 'note_added' | 'undo'
  previousStatus?: ApplicationStatus
  newStatus?: ApplicationStatus
  previousPriority?: boolean
  newPriority?: boolean
  note?: string
  actor?: { _id: string; name?: string; role?: UserRole }
  createdAt: string
}

export type ApplicationFilterOptions = {
  candidates: Array<Pick<User, '_id' | 'name' | 'email' | 'telephone'>>
  jobs: Array<{
    _id: string
    title: string
    company?: string
    status: JobStatus
    archivedAt?: string
  }>
  educationLevels: string[]
}

export type ApplicationExportScope = 'filtered' | 'selected'
export type ApplicationExportStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'

export type ApplicationExportRequest = {
  exportId: string
  scope: ApplicationExportScope
  filters: ApplicationWorkspaceFilters
  recordCount: number
  status: ApplicationExportStatus
  revision: number
  requester?: Pick<User, '_id' | 'name' | 'email' | 'role'>
  reviewer?: Pick<User, '_id' | 'name' | 'role'>
  rejectionReason?: string
  requestedAt: string
  reviewedAt?: string
  pendingExpiresAt: string
  downloadExpiresAt?: string
  downloadCount: number
  downloadsRemaining: number
  lastDownloadedAt?: string
}

export type ApplicationExportRequestFilters = {
  page?: number
  limit?: number
  status?: ApplicationExportStatus
}

export type ApplicationExportRequestResponse = PaginatedResponse<ApplicationExportRequest>

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
  view?: 'candidates' | 'registered'
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
  classification: 'candidate' | 'registered-user'
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

export type CandidateDeletionResult = {
  candidateId: string
  deletedApplications: number
  deletedApplicationActivities: number
  deletedExportRequests: number
}

export type DashboardStats = {
  totalJobs: number
  activeJobs: number
  totalApplications?: number
  totalCandidates?: number
  totalTeamMembers?: number
}

export type StaffMember = {
  _id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  telephone: string
  role: Extract<UserRole, 'admin' | 'recruiter' | 'super-admin'>
  setupStatus: 'active' | 'invited' | 'suspended'
  suspendedAt: string | null
  lastLoginAt: string | null
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateStaffPayload = {
  firstName: string
  lastName: string
  email: string
  telephone: string
  role: Extract<UserRole, 'admin' | 'recruiter'>
  setupMode: 'password' | 'invitation'
  password?: string
}

export type PublicPlatformSettings = {
    supportEmail: string
    timeZone: string
    candidateRegistrationEnabled: boolean
}

export type StaffSessionDurationHours = 8 | 24 | 72 | 168 | 720

export type StaffSessionDurationPolicy = {
  admin: StaffSessionDurationHours
  recruiter: StaffSessionDurationHours
  superAdmin: StaffSessionDurationHours
}

export type OrganizationSettings = PublicPlatformSettings & {
  staffSessionDurationHours: StaffSessionDurationPolicy
  revision: number
  updatedAt?: string
  updatedBy?: {
    _id: string
    name?: string
  }
}

export type OrganizationSettingsUpdate = Partial<Pick<
  OrganizationSettings,
  'supportEmail' | 'timeZone' | 'candidateRegistrationEnabled' | 'staffSessionDurationHours'
>> & {
  revision: number
}

export type StaffProfilePayload = {
  firstName: string
  lastName: string
  telephone: string
}

export type SavedJobMutation = {
  jobId: string
  saved: boolean
}

export type BlogPost = {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: BlogCategory
  content: string
  status: BlogStatus
  postedBy: { name: string }
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  coverImage?: {
    secureUrl: string
    alt: string
    width: number
    height: number
  }
  __v?: number
}

export type BlogPostSummary = Omit<BlogPost, 'content'>

export type CreateBlogPostPayload = Pick<
  BlogPost,
  'title' | 'slug' | 'excerpt' | 'category' | 'content'
> & {
  status?: BlogStatus
  coverImageFile?: File
  coverImageAlt?: string
}

export type AdminBlogStatusFilter = BlogStatus | 'all'
export type AdminBlogSort = 'newest' | 'oldest' | 'updated' | 'title'

export type AdminBlogFilters = {
  page?: number
  limit?: number
  search?: string
  status?: AdminBlogStatusFilter
  category?: BlogCategory | 'all'
  sort?: AdminBlogSort
}

export type AdminBlogResponse = PaginatedResponse<BlogPost> & {
  summary: {
    all: number
    draft: number
    published: number
  }
}

export type UpdateBlogPostPayload = Partial<CreateBlogPostPayload> & {
  postId: string
  version: number
  removeCoverImage?: boolean
}

export type DeleteBlogPostPayload = {
  postId: string
  confirmationTitle: string
  version: number
}
