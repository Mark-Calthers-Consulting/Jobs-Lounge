/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ArticleCover, { BLOG_CATEGORY_ARTWORK } from './ArticleCover'
import { BLOG_CATEGORIES } from '@/constants/enums'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

const basePost = {
  title: 'A better career move',
  category: 'Career growth' as const,
}

describe('article cover', () => {
  it('defines restrained fallback artwork for every controlled category', () => {
    expect(Object.keys(BLOG_CATEGORY_ARTWORK)).toEqual([...BLOG_CATEGORIES])
    const { container } = render(
      <ArticleCover post={basePost} sizes="100vw" className="aspect-video" />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.getByText('Career growth')).toBeInTheDocument()
  })

  it('uses managed image metadata when an article has a cover', () => {
    render(
      <ArticleCover
        post={{
          ...basePost,
          coverImage: {
            secureUrl: 'https://res.cloudinary.com/demo/image/upload/cover.webp',
            alt: 'A professional reviewing their goals',
            width: 1600,
            height: 900,
          },
        }}
        sizes="100vw"
      />,
    )
    expect(screen.getByRole('img', { name: 'A professional reviewing their goals' }))
      .toHaveAttribute('src', expect.stringContaining('res.cloudinary.com'))
  })
})
