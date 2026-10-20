import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ApplicationFilters from './ApplicationFilters'

const { replace, searchParams } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams('academicAssessment=meets'),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin-center/applications/jobs/job-1',
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}))

vi.mock('@/hooks/useApplicationWorkspace', () => ({
  useApplicationFilterOptions: () => ({
    data: { candidates: [], jobs: [], educationLevels: [] },
  }),
}))

describe('application filters', () => {
  beforeEach(() => {
    replace.mockClear()
  })

  it('explains and disables academic filtering when the vacancy has no minimum', () => {
    render(<ApplicationFilters academicAssessmentAvailable={false} />)

    expect(screen.getByText('Academic assessment is unavailable for this vacancy')).toBeInTheDocument()
    expect(screen.getByText(/does not have a minimum academic qualification/)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Academic assessment/ })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Clear academic filter' }))

    expect(replace).toHaveBeenCalledWith(
      '/admin-center/applications/jobs/job-1?',
      { scroll: false },
    )
  })
})
