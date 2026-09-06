import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Job } from '@/types/types'
import HomepageDiscovery, { featuredCategories, vacancySalary } from './HomepageDiscovery'

const useFeaturedJobs = vi.fn()
const useJobFilterOptions = vi.fn()

vi.mock('@/hooks/useVacancies', () => ({
  useFeaturedJobs: () => useFeaturedJobs(),
  useJobFilterOptions: () => useJobFilterOptions(),
}))

const job = (id: number, salary?: Job['salary']): Job => ({
  _id: `job-${id}`,
  title: `Vacancy ${id}`,
  description: 'A useful opportunity.',
  category: 'Technology & ICT',
  location: 'Lagos',
  workMode: 'Hybrid',
  jobType: 'Full-time',
  level: 'Mid',
  company: { name: 'Example Company' },
  salary,
  responsibilities: [],
  benefits: [],
  requirements: [],
  skills: [],
  experience: 2,
  status: 'Open',
  views: 0,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
})

describe('homepage discovery', () => {
  beforeEach(() => {
    useJobFilterOptions.mockReturnValue({
      data: {
        categories: [
          { value: 'Other', count: 1 },
          { value: 'Technology & ICT', count: 8 },
          { value: 'FMCG', count: 6 },
          { value: 'Education & Training', count: 3 },
          { value: 'Customer Service & Support', count: 4 },
          { value: 'Legal, Compliance & Audit', count: 4 },
          { value: 'Consulting & Strategy', count: 5 },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useFeaturedJobs.mockReturnValue({
      data: Array.from({ length: 7 }, (_, index) => job(index + 1)),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  it('ranks categories by count, uses alphabetical tie-breaking, and limits the result', () => {
    expect(featuredCategories([
      { value: 'Legal', count: 4 },
      { value: 'Customer', count: 4 },
      { value: 'Technology', count: 8 },
    ])).toEqual([
      { value: 'Technology', count: 8 },
      { value: 'Customer', count: 4 },
      { value: 'Legal', count: 4 },
    ])

    render(<HomepageDiscovery />)

    expect(screen.getByRole('link', { name: /Technology & ICT/ }))
      .toHaveAttribute('href', '/vacancies?category=Technology%20%26%20ICT')
    expect(screen.getByRole('link', { name: /Customer Service & Support/ }))
      .toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Legal, Compliance & Audit/ }))
      .toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Other/ })).not.toBeInTheDocument()
  })

  it('shows at most six latest vacancies', () => {
    render(<HomepageDiscovery />)

    expect(screen.getByRole('link', { name: 'View Vacancy 1 at Example Company' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Vacancy 6 at Example Company' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View Vacancy 7 at Example Company' })).not.toBeInTheDocument()
  })

  it('formats missing, bounded, and partially disclosed salaries', () => {
    expect(vacancySalary(job(1))).toBe('Salary not specified')
    expect(vacancySalary(job(2, { min: 150_000, max: 200_000, currency: 'NGN' })))
      .toMatch(/150,000.*200,000/)
    expect(vacancySalary(job(3, { min: 150_000, currency: 'NGN' }))).toMatch(/^From .*150,000/)
    expect(vacancySalary(job(4, { max: 200_000, currency: 'NGN' }))).toMatch(/^Up to .*200,000/)
  })

  it('lets category and vacancy failures be retried independently', () => {
    const retryCategories = vi.fn()
    const retryJobs = vi.fn()
    useJobFilterOptions.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: retryCategories })
    useFeaturedJobs.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: retryJobs })

    render(<HomepageDiscovery />)
    const retryButtons = screen.getAllByRole('button', { name: 'Try again' })
    fireEvent.click(retryButtons[0])
    fireEvent.click(retryButtons[1])

    expect(retryCategories).toHaveBeenCalledOnce()
    expect(retryJobs).toHaveBeenCalledOnce()
  })

  it('shows purposeful empty states', () => {
    useJobFilterOptions.mockReturnValue({ data: { categories: [] }, isLoading: false, isError: false, refetch: vi.fn() })
    useFeaturedJobs.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })

    render(<HomepageDiscovery />)
    expect(screen.getByRole('heading', { name: 'New fields are opening soon' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'More opportunities are on the way' })).toBeInTheDocument()
  })
})
