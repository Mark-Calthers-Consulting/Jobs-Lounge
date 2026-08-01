import { describe, expect, it } from 'vitest'

import type { BlogPost } from '@/types/types'
import {
  buildArticleMetadata,
  buildArticleStructuredData,
  serializeStructuredData,
} from './blogArticle'

const post: BlogPost = {
  _id: 'post-1',
  title: 'A stronger interview',
  slug: 'a-stronger-interview',
  excerpt: 'Practical preparation for your next interview.',
  category: 'Interviews',
  content: 'Useful guidance.',
  status: 'Published',
  postedBy: { name: 'Jobs Lounge team' },
  publishedAt: '2026-07-10T08:00:00.000Z',
  createdAt: '2026-07-09T08:00:00.000Z',
  updatedAt: '2026-07-11T08:00:00.000Z',
  coverImage: {
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/article.webp',
    alt: 'A candidate preparing for an interview',
    width: 1600,
    height: 900,
  },
}

describe('article discovery metadata', () => {
  it('builds canonical social metadata from the public article contract', () => {
    const canonical = 'https://mccjobslounge.markcalthers.com/blog/a-stronger-interview'
    const metadata = buildArticleMetadata(post, canonical)

    expect(metadata.alternates?.canonical).toBe(canonical)
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      title: post.title,
      publishedTime: post.publishedAt,
    })
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' })
  })

  it('emits safe BlogPosting data without private storage metadata', () => {
    const structured = buildArticleStructuredData(post, 'https://example.com/blog/article')
    const serialized = serializeStructuredData(structured)

    expect(structured).toMatchObject({
      '@type': 'BlogPosting',
      headline: post.title,
      author: { name: 'Jobs Lounge team' },
    })
    expect(serialized).not.toContain('assetId')
    expect(serialized).not.toContain('bytes')
    expect(serializeStructuredData({ value: '</script>' })).not.toContain('</script>')
  })
})
