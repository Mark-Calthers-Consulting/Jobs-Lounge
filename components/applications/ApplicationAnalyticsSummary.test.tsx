import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApplicationAnalyticsSummary as Summary } from '@/types/types'
import ApplicationAnalyticsSummary from './ApplicationAnalyticsSummary'

const { useAnalytics } = vi.hoisted(() => ({ useAnalytics: vi.fn() }))

vi.mock('@/hooks/useApplicationWorkspace', () => ({
  useApplicationAnalyticsSummary: useAnalytics,
}))

const daily = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 7, 28 + index)).toISOString().slice(0, 10)
  return { date, count: index === 29 ? 4 : 0 }
})

const summary: Summary = {
  applications: { today: 2, week: 8, month: 16, allTime: 100 },
  recruitment: {
    period: {
      fromDate: '2026-08-28', throughDate: '2026-09-26',
      previousFromDate: '2026-07-29', previousThroughDate: '2026-08-27',
    },
    applications: {
      current: 4, previous: 0, distinctApplicants: 3, daily,
      currentStages: { pending: 2, reviewed: 1, shortlisted: 1, rejected: 0 },
    },
    workload: { pendingOlderThanSevenDays: 6, openVacanciesWithoutApplications: 2 },
    candidates: { registered: 120, profilesComplete: 80, everApplied: 61 },
    topVacancies: [
      { jobId: 'job-1', title: 'Operations analyst', company: 'MCC', status: 'Open', archived: false, available: true, applications: 3 },
      { jobId: 'job-2', title: 'Vacancy unavailable', company: null, status: null, archived: false, available: false, applications: 1 },
    ],
  },
  confirmations: { queued: 1, sent: 12, retrying: 0, failed: 0, retentionDays: 30 },
  timeZone: 'Africa/Lagos',
  generatedAt: '2026-09-27T10:00:00.000Z',
}

describe('super-admin application analytics', () => {
  beforeEach(() => {
    useAnalytics.mockReturnValue({ data: summary, isLoading: false, isError: false, refetch: vi.fn() })
  })

  it('preserves headline totals and shows period, current workload, candidate snapshot and workspace links', () => {
    render(<ApplicationAnalyticsSummary />)

    expect(screen.getByRole('heading', { name: 'Application trend' })).toBeInTheDocument()
    expect(screen.getByText('No applications in the previous period.')).toBeInTheDocument()
    expect(screen.getByText(/Current stages of applications received in the 30-day period/)).toBeInTheDocument()
    expect(screen.getByText(/Current backlog across all applications/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Operations analyst' })).toHaveAttribute('href', '/admin-center/applications/jobs/job-1')
    expect(screen.queryByRole('link', { name: 'Vacancy unavailable' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review open vacancies' })).toHaveAttribute('href', '/admin-center/applications/by-vacancy?view=open')
    expect(screen.getByRole('link', { name: 'Open candidates' })).toHaveAttribute('href', '/admin-center/candidates')
    expect(screen.getByRole('heading', { name: 'Application confirmation emails' })).toBeInTheDocument()
    expect(screen.getByText('Profiles complete now')).toBeInTheDocument()
  })

  it('offers a keyboard-accessible daily data table with all 30 completed days', () => {
    render(<ApplicationAnalyticsSummary />)

    fireEvent.click(screen.getByText('View daily application counts'))
    const table = screen.getByRole('table', { name: 'Applications received on each completed calendar day' })
    expect(within(table).getAllByRole('row')).toHaveLength(31)
    expect(within(table).getByText('26 Sept 2026')).toBeInTheDocument()
    expect(within(table).getByText('28 Aug 2026')).toBeInTheDocument()
  })

  it('explains an empty period without implying a historical hiring funnel', () => {
    useAnalytics.mockReturnValue({
      data: {
        ...summary,
        recruitment: {
          ...summary.recruitment,
          applications: { ...summary.recruitment.applications, current: 0, previous: 0, distinctApplicants: 0, daily: daily.map((day) => ({ ...day, count: 0 })) },
          topVacancies: [],
        },
      },
      isLoading: false, isError: false, refetch: vi.fn(),
    })
    render(<ApplicationAnalyticsSummary />)

    expect(screen.getByText('No applications in either period.')).toBeInTheDocument()
    expect(screen.getByText(/No applications were received during these 30 completed days/)).toBeInTheDocument()
    expect(screen.getByText('No vacancies received applications in this period.')).toBeInTheDocument()
  })
})
