import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminDashboardClient from './AdminDashboardClient'

const { useUser, useAdminDashboard, useAdminVacancies, useApplicationsOverview } = vi.hoisted(() => ({
  useUser: vi.fn(),
  useAdminDashboard: vi.fn(),
  useAdminVacancies: vi.fn(),
  useApplicationsOverview: vi.fn(),
}))

vi.mock('@/hooks/useUsers', () => ({ useUser }))
vi.mock('@/hooks/useAdmin', () => ({ useAdminDashboard, useAdminVacancies }))
vi.mock('@/hooks/useApplicationWorkspace', () => ({ useApplicationsOverview }))
vi.mock('@/components/PlatformSettingsProvider', () => ({ usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }) }))
vi.mock('@/components/AdminAccessNotice', () => ({ default: () => null }))

const daily = Array.from({ length: 30 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 7, 28 + index)).toISOString().slice(0, 10),
  count: index === 29 ? 3 : 0,
}))

const reviewerData = {
  totalJobs: 12,
  activeJobs: 4,
  totalApplications: 18,
  totalCandidates: 10,
  insights: {
    timeZone: 'Africa/Lagos',
    period: { fromDate: '2026-08-28', throughDate: '2026-09-26', previousFromDate: '2026-07-29', previousThroughDate: '2026-08-27' },
    pendingOverSevenDays: 2,
    registeredCandidates: 20,
    applications: { current: 3, previous: 0, daily },
    registrations: { current: 1, previous: 2, daily: daily.map((day) => ({ ...day, count: day.count ? 1 : 0 })) },
  },
}

const vacancyData = {
  data: [{ _id: 'job-1', title: 'Operations analyst', company: { name: 'MCC' }, location: 'Lagos', status: 'Open', totalApplicants: 3, updatedAt: '2026-09-26T10:00:00.000Z' }],
  summary: { all: 12, open: 4, draft: 1, deadlinePassed: 2 },
}

const applicationData = {
  totals: { pending: 5, reviewed: 4, shortlisted: 2, rejected: 1 },
  recentApplications: [{ applicationId: 'app-1', jobId: 'job-1', name: 'Ada Okafor', title: 'Operations analyst', status: 'pending', createdAt: '2026-09-26T10:00:00.000Z' }],
  vacancyWorkloads: [{ jobId: 'job-1', title: 'Operations analyst', company: 'MCC', total: 3, byStatus: { pending: 2 } }],
}

describe('staff dashboard home', () => {
  beforeEach(() => {
    useUser.mockReturnValue({ data: { role: 'recruiter', firstName: 'Yinka' }, isLoading: false })
    useAdminDashboard.mockReturnValue({ data: reviewerData, isLoading: false, isError: false })
    useAdminVacancies.mockReturnValue({ data: vacancyData, isLoading: false, isError: false })
    useApplicationsOverview.mockReturnValue({ data: applicationData, isLoading: false, isError: false })
  })

  it('shows five clear reviewer metrics, real comparison wording and workspace links', () => {
    render(<AdminDashboardClient />)
    const snapshot = screen.getByRole('region', { name: 'Workspace snapshot' })

    expect(within(snapshot).getByRole('link', { name: /Open vacancies/ })).toHaveAttribute('href', '/admin-center/jobs?view=open')
    expect(within(snapshot).getByRole('link', { name: /Applications awaiting first review/ })).toHaveAttribute('href', '/admin-center/applications/inbox?status=pending&sort=oldest')
    expect(within(snapshot).getByRole('link', { name: /Applications awaiting first review/ })).toHaveTextContent('More than seven days old')
    expect(within(snapshot).getByRole('link', { name: /Applications received \(last 30 days\)/ })).toHaveAttribute('href', '/admin-center/applications/inbox')
    expect(within(snapshot).getByRole('link', { name: /In review/ })).toHaveAttribute('href', '/admin-center/applications/inbox?status=reviewed')
    expect(within(snapshot).getByRole('link', { name: /Registered candidates/ })).toHaveAttribute('href', '/admin-center/candidates?view=registered')
    expect(within(snapshot).queryByText('Draft vacancies')).not.toBeInTheDocument()
    expect(within(snapshot).getByRole('link', { name: /Applications received/ })).toHaveTextContent('All review stages')
    expect(within(snapshot).getByRole('link', { name: /Applications received/ })).toHaveTextContent('3 vs 0 prior')
    expect(within(snapshot).getByRole('link', { name: /Registered candidates/ })).toHaveTextContent('New registrations: −50%')
    expect(within(snapshot).getByRole('link', { name: /Open vacancies/ })).not.toHaveTextContent(/%|Currently open/)
    expect(within(snapshot).getByRole('link', { name: /Applications awaiting first review/ })).not.toHaveTextContent(/%|opens oldest first/)
    expect(screen.getByRole('link', { name: 'Create vacancy' })).toHaveAttribute('href', '/admin-center/jobs/create')
    expect(within(screen.getByRole('region', { name: 'Recent vacancies' })).getByRole('link', { name: /Operations analyst/ })).toHaveAttribute('href', '/admin-center/jobs/job-1')
  })

  it('does not invent a percentage when both activity periods have zero records', () => {
    useAdminDashboard.mockReturnValue({
      data: {
        ...reviewerData,
        insights: {
          ...reviewerData.insights,
          applications: { current: 0, previous: 0, daily: daily.map((day) => ({ ...day, count: 0 })) },
        },
      },
      isLoading: false,
      isError: false,
    })
    render(<AdminDashboardClient />)

    const card = screen.getByRole('link', { name: /Applications received/ })
    expect(card).toHaveTextContent('No change vs prior period')
    expect(card).not.toHaveTextContent('0%')
    expect(card.querySelector('polyline')).toBeInTheDocument()
  })

  it('keeps recruitment information out of the admin dashboard', () => {
    useUser.mockReturnValue({ data: { role: 'admin', firstName: 'Yinka' }, isLoading: false })
    useAdminDashboard.mockReturnValue({ data: { totalJobs: 12, activeJobs: 4 }, isLoading: false, isError: false })
    render(<AdminDashboardClient />)

    expect(useApplicationsOverview).toHaveBeenCalledWith(false)
    const snapshot = screen.getByRole('region', { name: 'Workspace snapshot' })
    expect(within(snapshot).getAllByRole('link')).toHaveLength(3)
    expect(within(snapshot).queryByText('Registered candidates')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Recruitment activity' })).not.toBeInTheDocument()
    expect(screen.queryByText('3 applicants')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Manage vacancies' })).toHaveAttribute('href', '/admin-center/jobs')
  })

  it('shows honest empty states when there are no vacancies or urgent tasks', () => {
    useUser.mockReturnValue({ data: { role: 'admin' }, isLoading: false })
    useAdminDashboard.mockReturnValue({ data: { totalJobs: 0, activeJobs: 0 }, isLoading: false, isError: false })
    useAdminVacancies.mockReturnValue({ data: { data: [], summary: { all: 0, open: 0, draft: 0, deadlinePassed: 0 } }, isLoading: false, isError: false })
    render(<AdminDashboardClient />)

    expect(screen.getByText('No vacancies yet')).toBeInTheDocument()
    expect(screen.getByText('Nothing urgent')).toBeInTheDocument()
  })

  it('does not claim the attention queue is clear when a source fails', () => {
    useAdminDashboard.mockReturnValue({ data: { ...reviewerData, insights: undefined }, isLoading: false, isError: true })
    useApplicationsOverview.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    useAdminVacancies.mockReturnValue({ data: { data: vacancyData.data, summary: { all: 0, open: 0, draft: 0, deadlinePassed: 0 } }, isLoading: false, isError: false })
    render(<AdminDashboardClient />)

    expect(screen.getByText(/Attention items could not be confirmed/)).toBeInTheDocument()
    expect(screen.queryByText('Nothing urgent')).not.toBeInTheDocument()
  })
})
