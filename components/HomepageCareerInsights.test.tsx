import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BlogPostSummary } from '@/types/types'

import HomepageCareerInsights from './HomepageCareerInsights'

const useGetBlogPosts = vi.fn()

vi.mock('@/hooks/useBlog', () => ({
  useGetBlogPosts: (...args: unknown[]) => useGetBlogPosts(...args),
}))

vi.mock('@/components/PlatformSettingsProvider', () => ({
  usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))

const post = (index: number): BlogPostSummary => ({
  _id: `post-${index}`,
  title: `Career article ${index}`,
  slug: `career-article-${index}`,
  excerpt: `Practical guidance for article ${index}.`,
  category: 'Career growth',
  status: 'Published',
  postedBy: { name: 'Jobs Lounge' },
  publishedAt: '2026-09-01T10:00:00.000Z',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
})

describe('HomepageCareerInsights', () => {
  beforeEach(() => {
    useGetBlogPosts.mockReset()
  })

  it('shows the three newest articles in an editorial layout', () => {
    useGetBlogPosts.mockReturnValue({
      data: { data: [post(1), post(2), post(3)], pagination: { page: 1, limit: 3, total: 3, pages: 1 } },
      isLoading: false,
      isError: false,
    })

    render(<HomepageCareerInsights />)

    expect(useGetBlogPosts).toHaveBeenCalledWith(1, 3)
    expect(screen.getByRole('link', { name: 'Read Career article 1' })).toHaveAttribute('href', '/blog/career-article-1')
    expect(screen.getByRole('link', { name: 'Read Career article 3' })).toHaveAttribute('href', '/blog/career-article-3')
    expect(screen.getByRole('link', { name: 'View all articles' })).toHaveAttribute('href', '/blog')
  })

  it('supports retry and a purposeful empty state', () => {
    const refetch = vi.fn()
    useGetBlogPosts.mockReturnValueOnce({ isLoading: false, isError: true, refetch })
    const { rerender } = render(<HomepageCareerInsights />)

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledOnce()

    useGetBlogPosts.mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 3, total: 0, pages: 0 } },
      isLoading: false,
      isError: false,
    })
    rerender(<HomepageCareerInsights />)
    expect(screen.getByRole('heading', { name: 'Fresh career guidance is on the way' })).toBeInTheDocument()
  })
})
