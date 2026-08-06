import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VacancySummaryButton from './VacancySummaryButton'

const downloadVacancySummary = vi.fn()
const saveDownloadedFile = vi.fn()

vi.mock('@/api/applicationWorkspace', () => ({
  downloadVacancySummary: (...args: unknown[]) => downloadVacancySummary(...args),
  saveDownloadedFile: (...args: unknown[]) => saveDownloadedFile(...args),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('vacancy summary export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    downloadVacancySummary.mockResolvedValue({
      blob: new Blob(['summary']),
      filename: 'vacancy-summary.csv',
    })
  })

  it('preserves the active vacancy search, view, and sort filters', async () => {
    render(<VacancySummaryButton filters={{
      search: 'sales manager',
      view: 'open',
      sort: 'applications',
    }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Download vacancy summary' }))

    await waitFor(() => expect(downloadVacancySummary).toHaveBeenCalledWith({
      search: 'sales manager',
      view: 'open',
      sort: 'applications',
    }))
    expect(saveDownloadedFile).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'vacancy-summary.csv',
    }))
  })
})
