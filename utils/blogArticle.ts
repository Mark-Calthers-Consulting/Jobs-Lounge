import type { Metadata } from 'next'

import type { BlogPost } from '@/types/types'

export const articleCanonicalUrl = (slug: string) => {
  const origin = (process.env.NEXT_PUBLIC_ORIGIN || 'https://jobslounge.markcalthers.com')
    .replace(/\/+$/, '')
  return `${origin}/blog/${encodeURIComponent(slug)}`
}

export const buildArticleMetadata = (post: BlogPost, canonicalUrl: string): Metadata => {
  const publishedAt = post.publishedAt || post.createdAt
  const image = post.coverImage
    ? [{
        url: post.coverImage.secureUrl,
        width: post.coverImage.width,
        height: post.coverImage.height,
        alt: post.coverImage.alt,
      }]
    : undefined

  return {
    title: `${post.title} | Jobs Lounge`,
    description: post.excerpt,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      siteName: 'Jobs Lounge',
      title: post.title,
      description: post.excerpt,
      publishedTime: publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.postedBy.name],
      ...(image ? { images: image } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.excerpt,
      ...(image ? { images: image.map(({ url, alt }) => ({ url, alt })) } : {}),
    },
  }
}

export const buildArticleStructuredData = (post: BlogPost, canonicalUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  mainEntityOfPage: canonicalUrl,
  headline: post.title,
  description: post.excerpt,
  datePublished: post.publishedAt || post.createdAt,
  dateModified: post.updatedAt,
  author: {
    '@type': 'Person',
    name: post.postedBy.name,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Jobs Lounge',
  },
  ...(post.coverImage
    ? {
        image: {
          '@type': 'ImageObject',
          url: post.coverImage.secureUrl,
          width: post.coverImage.width,
          height: post.coverImage.height,
        },
      }
    : {}),
})

export const serializeStructuredData = (value: object) => JSON.stringify(value).replace(/</g, '\\u003c')
