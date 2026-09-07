import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFeaturedJobs } from '@/hooks/useVacancies'
import type { Job } from '@/types/types'

import HomepageHeroVacancy from './HomepageHeroVacancy'

vi.mock('@/hooks/useVacancies', () => ({
  useFeaturedJobs: vi.fn(),
}))

const mockedUseFeaturedJobs = vi.mocked(useFeaturedJobs)

const vacancy = {
  _id: 'vacancy-1',
  title: 'Senior Product Designer',
  location: 'Lagos',
  workMode: 'Hybrid',
  company: { name: 'Jobs Lounge' },
} as Job

describe('HomepageHeroVacancy', () => {
  beforeEach(() => {
    mockedUseFeaturedJobs.mockReset()
  })

  it('links the newest available vacancy from the hero', () => {
    mockedUseFeaturedJobs.mockReturnValue({ data: [vacancy], isLoading: false } as unknown as ReturnType<typeof useFeaturedJobs>)

    render(<HomepageHeroVacancy />)

    expect(screen.getByText('Recently added')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Senior Product Designer at Jobs Lounge' })).toHaveAttribute('href', '/vacancies/vacancy-1')
    expect(screen.getByText(/Lagos/)).toHaveTextContent('Lagos · Hybrid')
  })

  it('uses a purposeful loading state and disappears when no vacancy is available', () => {
    mockedUseFeaturedJobs.mockReturnValueOnce({ isLoading: true } as unknown as ReturnType<typeof useFeaturedJobs>)
    const { rerender } = render(<HomepageHeroVacancy />)
    expect(screen.getByRole('status', { name: 'Loading latest vacancy' })).toBeInTheDocument()

    mockedUseFeaturedJobs.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useFeaturedJobs>)
    rerender(<HomepageHeroVacancy />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
