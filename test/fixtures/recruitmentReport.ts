import type { AnalyticsComparison, ApplicationAnalyticsSummary } from '@/types/types'

const compare = (current: number, previous: number): AnalyticsComparison => ({
  current,
  previous,
  change: current - previous,
  percentageChange: previous ? Math.round(((current - previous) / previous) * 1000) / 10 : null,
})

export function recruitmentReport({
  days = 30,
  empty = false,
  large = false,
}: { days?: number; empty?: boolean; large?: boolean } = {}): ApplicationAnalyticsSummary {
  const start = Date.UTC(2026, 8, 27) - days * 86400000
  const daily = Array.from({ length: days }, (_, index) => ({
    date: new Date(start + index * 86400000).toISOString().slice(0, 10),
    count: empty ? 0 : ((index * 7 + 13) % 47) + (large ? 65000 : 0),
  }))
  const previousDaily = daily.map((row, index) => ({
    date: new Date(start + (index - days) * 86400000).toISOString().slice(0, 10),
    count: empty ? 0 : index % 19,
  }))
  const current = daily.reduce((total, row) => total + row.count, 0)
  const previous = previousDaily.reduce((total, row) => total + row.count, 0)
  const registrations = daily.map((row) => ({ ...row, count: Math.floor(row.count / 7) }))
  const previousRegistrations = previousDaily.map((row) => ({
    ...row,
    count: Math.floor(row.count / 7),
  }))
  return {
    applications: {
      today: empty ? 0 : 2,
      week: empty ? 0 : 8,
      month: current,
      allTime: current + previous,
    },
    recruitment: {
      period: {
        fromDate: daily[0].date,
        throughDate: daily.at(-1)!.date,
        previousFromDate: previousDaily[0].date,
        previousThroughDate: previousDaily.at(-1)!.date,
        preset: 'last30',
        dayCount: days,
        incomplete: false,
      },
      applications: {
        current,
        previous,
        distinctApplicants: Math.floor(current / 2),
        daily,
        previousDaily,
        comparison: compare(current, previous),
        applicantComparison: compare(Math.floor(current / 2), Math.floor(previous / 2)),
        currentStages: {
          pending: Math.floor(current / 2),
          reviewed: current - Math.floor(current / 2),
          shortlisted: 0,
          rejected: 0,
        },
      },
      registrations: {
        ...compare(
          registrations.reduce((total, row) => total + row.count, 0),
          previousRegistrations.reduce((total, row) => total + row.count, 0),
        ),
        daily: registrations,
        previousDaily: previousRegistrations,
      },
      workload: {
        pendingOlderThanSevenDays: empty ? 0 : 6,
        openVacanciesWithoutApplications: empty ? 0 : 2,
      },
      candidates: {
        registered: empty ? 0 : large ? 1547652 : 120,
        profilesComplete: empty ? 0 : 80,
        everApplied: empty ? 0 : 61,
      },
      topVacancies: empty
        ? []
        : Array.from({ length: 10 }, (_, index) => ({
            jobId: `job-${index}`,
            title: large
              ? 'Senior commercial operations and regional business development executive for enterprise partnerships'
              : index === 0
                ? 'Operations analyst'
                : index === 1
                  ? 'Vacancy unavailable'
                  : `Sales executive ${index}`,
            company: 'Mark Calthers Consulting Limited',
            status: 'Open',
            archived: false,
            available: index !== 1,
            applications: Math.max(1, Math.floor(current / (index + 3))),
          })),
    },
    confirmations: { queued: 1, sent: 12, retrying: 0, failed: 0, retentionDays: 30 },
    timeZone: 'Africa/Lagos',
    generatedAt: '2026-09-27T10:00:00.000Z',
  }
}
