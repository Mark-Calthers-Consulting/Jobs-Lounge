import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Vacancies from './page'

const navigation = vi.hoisted(() => ({
  queryString: 'location=Lagos&page=3&search=old',
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => '/vacancies',
  useSearchParams: () => new URLSearchParams(navigation.queryString),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

vi.mock('@/hooks/useVacancies', () => ({
  useVacancies: () => ({
    data: {
      status: 'success',
      count: 0,
      data: [],
      pagination: {
        page: 1,
        limit: 18,
        total: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useJobFilterOptions: () => ({
    data: { categories: [], workModes: [], jobTypes: [], levels: [], locations: [] },
    isLoading: false,
    isError: false,
  }),
}))

describe('vacancies hero search', () => {
  beforeEach(() => {
    navigation.queryString = 'location=Lagos&page=3&search=old'
    navigation.replace.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the hero copy and a decorative generated image', () => {
    const { container } = render(<Vacancies />)

    expect(screen.getByRole('heading', { name: 'Find work that moves you forward.' })).toBeInTheDocument()
    expect(screen.getByText('Explore opportunities across leading companies and take the next step in your career.')).toBeInTheDocument()
    expect(screen.getByRole('search', { name: 'Search vacancies' })).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/vacancies-hero.png')
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('applies the search immediately on submit, preserves other filters, and resets pagination', () => {
    render(<Vacancies />)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search vacancies by title' }), {
      target: { value: 'Data analyst' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search jobs' }))

    expect(navigation.replace).toHaveBeenCalledWith(
      '/vacancies?location=Lagos&search=Data+analyst',
      { scroll: false },
    )
  })

  it('submits on Enter and clears searches shorter than three characters', () => {
    render(<Vacancies />)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search vacancies by title' }), {
      target: { value: 'HR' },
    })
    fireEvent.submit(screen.getByRole('search', { name: 'Search vacancies' }))

    expect(navigation.replace).toHaveBeenCalledWith('/vacancies?location=Lagos', { scroll: false })
  })

  it('continues applying eligible searches live after the existing debounce', () => {
    vi.useFakeTimers()
    render(<Vacancies />)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search vacancies by title' }), {
      target: { value: 'Engineer' },
    })
    act(() => vi.advanceTimersByTime(400))

    expect(navigation.replace).toHaveBeenCalledWith(
      '/vacancies?location=Lagos&search=Engineer',
      { scroll: false },
    )
  })
})
