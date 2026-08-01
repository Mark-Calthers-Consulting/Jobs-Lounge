import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ArticleUtilityPanel from './ArticleUtilityPanel'

vi.mock('@/components/PlatformSettingsProvider', () => ({
  usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))

const props = {
  author: 'Ada Recruiter',
  category: 'Career growth' as const,
  publishedAt: '2026-07-10T08:00:00.000Z',
  readingMinutes: 4,
  title: 'Build a more focused career',
  url: 'https://mccjobslounge.markcalthers.com/blog/focused-career',
  layout: 'desktop' as const,
}

describe('article information and sharing', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset()
    writeText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
  })

  it('shows editorial metadata and correctly encoded share destinations', () => {
    render(<ArticleUtilityPanel {...props} />)

    expect(screen.getByText('Ada Recruiter')).toBeInTheDocument()
    expect(screen.getByText('10 July 2026')).toBeInTheDocument()
    expect(screen.getByText('4 min read')).toBeInTheDocument()
    expect(screen.getByText('Career growth')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent(props.url)),
    )
    expect(screen.getByRole('link', { name: /Share article on X/ })).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent(props.title)),
    )
  })

  it('copies the canonical article URL with live confirmation', async () => {
    render(<ArticleUtilityPanel {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy article link' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(props.url))
    expect(screen.getByRole('status')).toHaveTextContent('Article link copied.')
  })

  it('announces clipboard failures safely', async () => {
    writeText.mockRejectedValueOnce(new Error('permission denied'))
    render(<ArticleUtilityPanel {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy article link' }))

    await waitFor(() => expect(screen.getByRole('status'))
      .toHaveTextContent('Unable to copy the article link.'))
  })
})
