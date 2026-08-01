/* eslint-disable @next/next/no-img-element */
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CareerInsightsListing from './CareerInsightsListing'

const useGetBlogPosts = vi.fn()

vi.mock('@/hooks/useBlog', () => ({
  useGetBlogPosts: (...args: unknown[]) => useGetBlogPosts(...args),
}))
vi.mock('@/components/PlatformSettingsProvider', () => ({
  usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

const response = {
  data: [{
    _id: 'post-1',
    title: 'Write a stronger CV',
    slug: 'write-a-stronger-cv',
    excerpt: 'Practical ways to make your experience easier for recruiters to understand.',
    category: 'CV & applications',
    status: 'Published',
    postedBy: { name: 'Jobs Lounge team' },
    publishedAt: '2026-07-01T10:00:00.000Z',
    createdAt: '2026-06-30T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  }],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

describe('career insights listing', () => {
  beforeEach(() => {
    useGetBlogPosts.mockReturnValue({
      data: response,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  it('defaults to Grid and provides an accessible List view control', () => {
    render(<CareerInsightsListing />)
    const grid = screen.getByRole('button', { name: 'Grid view' })
    const list = screen.getByRole('button', { name: 'List view' })
    expect(grid).toHaveAttribute('aria-pressed', 'true')
    expect(list).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(list)
    expect(grid).toHaveAttribute('aria-pressed', 'false')
    expect(list).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('List view selected')).toBeInTheDocument()
  })

  it('renders article metadata, author, excerpt, and stable public routing', () => {
    render(<CareerInsightsListing />)
    expect(screen.getAllByText('CV & applications')).not.toHaveLength(0)
    expect(screen.getByText(/Practical ways/)).toBeInTheDocument()
    expect(screen.getByText('By Jobs Lounge team')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Write a stronger CV/ }))
      .toHaveAttribute('href', '/blog/write-a-stronger-cv')
  })

  it('shows a purposeful zero-post state', () => {
    useGetBlogPosts.mockReturnValue({
      data: { ...response, data: [], pagination: { ...response.pagination, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    render(<CareerInsightsListing />)
    expect(screen.getByRole('heading', { name: 'New guidance is on the way' })).toBeInTheDocument()
  })
})
