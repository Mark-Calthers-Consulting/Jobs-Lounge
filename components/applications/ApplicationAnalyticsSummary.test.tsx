import { fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ApplicationAnalyticsSummary from './ApplicationAnalyticsSummary'
import { recruitmentReport } from '@/test/fixtures/recruitmentReport'

const { useAnalytics, useVacancies, downloadCsv, saveFile, downloadPdf } = vi.hoisted(() => ({
  useAnalytics: vi.fn(),
  useVacancies: vi.fn(),
  downloadCsv: vi.fn(),
  saveFile: vi.fn(),
  downloadPdf: vi.fn(),
}))
vi.mock('@/hooks/useApplicationWorkspace', () => ({
  useApplicationAnalyticsSummary: useAnalytics,
  useVacancyAnalytics: useVacancies,
}))
vi.mock('@/api/applicationWorkspace', () => ({
  downloadRecruitmentAnalytics: downloadCsv,
  saveDownloadedFile: saveFile,
}))
vi.mock('./analytics/RecruitmentPdf', () => ({ downloadRecruitmentPdf: downloadPdf }))
const report = recruitmentReport()

describe('Super-admin recruitment reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAnalytics.mockReturnValue({
      data: report,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
    useVacancies.mockReturnValue({
      data: {
        data: [
          {
            ...report.recruitment.topVacancies[0],
            previous: 3,
            comparison: { current: 9, previous: 3, change: 6, percentageChange: 200 },
            currentStages: { pending: 3, reviewed: 6, shortlisted: 0, rejected: 0 },
          },
          {
            ...report.recruitment.topVacancies[1],
            previous: 2,
            comparison: { current: 0, previous: 2, change: -2, percentageChange: -100 },
            currentStages: { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0 },
          },
        ],
        pagination: {
          page: 1,
          total: 23,
          totalPages: 2,
          hasPreviousPage: false,
          hasNextPage: true,
        },
      },
      isPending: false,
      isError: false,
      isFetching: false,
    })
    downloadCsv.mockResolvedValue({ blob: new Blob(['csv']), filename: 'report.csv' })
    downloadPdf.mockResolvedValue(undefined)
  })

  it('preserves totals, shows period comparisons and separates current snapshots from period stages', () => {
    render(<ApplicationAnalyticsSummary />)
    expect(screen.getByRole('heading', { name: 'Application trend' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Registration trend' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Current review stages' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Calendar application totals' })).toBeInTheDocument()
    expect(screen.getByText('Profiles complete now')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Operations analyst' })).toHaveAttribute(
      'href',
      '/admin-center/applications/jobs/job-0',
    )
    expect(screen.queryByRole('link', { name: 'Vacancy unavailable' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review open vacancies' })).toHaveAttribute(
      'href',
      '/admin-center/applications/by-vacancy?view=open',
    )
    expect(
      screen.getByText(/Current stages of applications received in the selected period/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Across all records/)).toBeInTheDocument()
  })

  it('has labelled chart alternatives and daily tables for both periods', () => {
    render(<ApplicationAnalyticsSummary />)
    expect(
      screen.getByRole('img', { name: /Application trend: selected and previous periods/ }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByText('View daily application counts'))
    const table = screen.getByRole('table', { name: 'Application trend: daily data' })
    expect(within(table).getAllByRole('row')).toHaveLength(31)
    expect(within(table).getByRole('columnheader', { name: 'Previous date' })).toBeInTheDocument()
    expect(screen.getByText('View daily registration counts')).toHaveClass(
      'focus-visible:outline-2',
    )
  })

  it('requires applying a period before exports and sends the chosen preset', () => {
    render(<ApplicationAnalyticsSummary />)
    fireEvent.change(screen.getByLabelText('Reporting period'), { target: { value: 'last7' } })
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
    expect(screen.getByText(/Apply your chosen period/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Apply period' }))
    expect(useAnalytics).toHaveBeenLastCalledWith({ preset: 'last7' })
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  })

  it('validates custom ranges and supports form submission with Enter', () => {
    render(<ApplicationAnalyticsSummary />)
    fireEvent.change(screen.getByLabelText('Reporting period'), { target: { value: 'custom' } })
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-01-03' } })
    fireEvent.change(screen.getByLabelText('Through'), { target: { value: '2026-01-01' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Apply period' }).closest('form')!)
    expect(screen.getByRole('alert')).toHaveTextContent(/up to 366 days/)
    fireEvent.change(screen.getByLabelText('Through'), { target: { value: '2026-01-31' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Apply period' }).closest('form')!)
    expect(useAnalytics).toHaveBeenLastCalledWith({
      preset: 'custom',
      from: '2026-01-03',
      to: '2026-01-31',
    })
  })

  it('paginates vacancy results using fixed report dates', () => {
    render(<ApplicationAnalyticsSummary />)
    fireEvent.click(screen.getByRole('button', { name: 'Next vacancies' }))
    expect(useVacancies).toHaveBeenLastCalledWith(
      {
        preset: 'custom',
        from: report.recruitment.period.fromDate,
        to: report.recruitment.period.throughDate,
      },
      2,
    )
  })

  it('downloads the PDF from the displayed aggregate report and CSV from fixed dates', async () => {
    render(<ApplicationAnalyticsSummary />)
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))
    await waitFor(() => expect(downloadPdf).toHaveBeenCalledWith(report))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export CSV' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
    await waitFor(() =>
      expect(downloadCsv).toHaveBeenCalledWith({
        preset: 'custom',
        from: report.recruitment.period.fromDate,
        to: report.recruitment.period.throughDate,
      }),
    )
    await waitFor(() => expect(saveFile).toHaveBeenCalled())
  })

  it('keeps the report available after an export failure with a retryable error', async () => {
    downloadPdf.mockRejectedValue(new Error('PDF assets unavailable. Please try again.'))
    render(<ApplicationAnalyticsSummary />)
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('PDF assets unavailable'),
    )
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
    expect(screen.getByRole('heading', { name: 'Application trend' })).toBeInTheDocument()
  })

  it('shows empty and zero baseline states without invented percentages', () => {
    useAnalytics.mockReturnValue({
      data: recruitmentReport({ empty: true }),
      isLoading: false,
      isError: false,
    })
    useVacancies.mockReturnValue({
      data: { data: [], pagination: { total: 0, totalPages: 0 } },
      isPending: false,
      isError: false,
    })
    render(<ApplicationAnalyticsSummary />)
    expect(screen.getAllByText('No previous activity')).toHaveLength(3)
    expect(screen.getAllByText('No activity in either period.')).toHaveLength(2)
    expect(
      screen.getByText('No vacancies received applications in either period.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Infinity|NaN/)).not.toBeInTheDocument()
  })

  it('labels incomplete current periods and keeps email health independent', () => {
    useAnalytics.mockReturnValue({
      data: {
        ...report,
        recruitment: {
          ...report.recruitment,
          period: { ...report.recruitment.period, incomplete: true },
        },
      },
      isLoading: false,
      isError: false,
    })
    render(<ApplicationAnalyticsSummary />)
    expect(screen.getByText(/Includes today and is incomplete/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Application confirmation emails'))
    expect(screen.getByText(/Sent means accepted by SMTP/)).toBeInTheDocument()
  })

  it('disables exports during loading, refresh and report errors', () => {
    useAnalytics.mockReturnValue({ isLoading: true, isFetching: true })
    const view = render(<ApplicationAnalyticsSummary />)
    expect(
      screen.getByRole('status', { name: 'Loading application analytics' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeDisabled()
    useAnalytics.mockReturnValue({ isLoading: false, isError: true, refetch: vi.fn() })
    view.rerender(<ApplicationAnalyticsSummary />)
    expect(screen.getByRole('alert')).toHaveTextContent('Application analytics could not be loaded')
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  })
})
