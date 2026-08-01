import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { readApiResponse } from '@/api/errors'
import { serverApiUrl } from '@/api/serverBase'
import ArticleCover from '@/components/ArticleCover'
import ArticleUtilityPanel from '@/components/ArticleUtilityPanel'
import MarkdownArticle from '@/components/MarkdownArticle'
import type { ApiSuccess, BlogPageProps, BlogPost } from '@/types/types'
import { articleReadingMinutes } from '@/utils/blog'
import {
  articleCanonicalUrl,
  buildArticleMetadata,
  buildArticleStructuredData,
  serializeStructuredData,
} from '@/utils/blogArticle'

const getSingleBlogPost = cache(async (slug: string): Promise<BlogPost> => {
  const res = await fetch(
    serverApiUrl(`/blog/${encodeURIComponent(slug)}`),
    { cache: 'no-store' },
  )

  if (res.status === 404) notFound()

  const post = await readApiResponse<ApiSuccess<BlogPost>>(res, 'Failed to fetch post')
  return post.data
})

export const generateMetadata = async ({ params }: BlogPageProps): Promise<Metadata> => {
  const { slug } = await params
  const post = await getSingleBlogPost(slug)
  return buildArticleMetadata(post, articleCanonicalUrl(post.slug))
}

const BlogPage = async ({ params }: BlogPageProps) => {
  const { slug } = await params
  const post = await getSingleBlogPost(slug)
  const publishedAt = post.publishedAt || post.createdAt
  const readingMinutes = articleReadingMinutes(post.content)
  const canonicalUrl = articleCanonicalUrl(post.slug)
  const structuredData = buildArticleStructuredData(post, canonicalUrl)

  const utilityPanel = (layout: 'mobile' | 'desktop') => (
    <ArticleUtilityPanel
      author={post.postedBy.name}
      category={post.category}
      publishedAt={publishedAt}
      readingMinutes={readingMinutes}
      title={post.title}
      url={canonicalUrl}
      layout={layout}
    />
  )

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
      />

      <header>
        <div className="mx-auto max-w-[980px] px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12 lg:px-0">
          <Link
            href="/blog"
            className="inline-flex rounded-sm text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-[#1B1F87]"
          >
            ← Back to Career Insights
          </Link>
          <div className="mt-9 max-w-4xl">
            <p className="text-sm font-semibold text-[#184aa2]">{post.category}</p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-[-0.035em] text-[#101A35] sm:text-5xl sm:leading-[1.1]">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {post.excerpt}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-16 lg:px-10">
        <div className="lg:hidden">{utilityPanel('mobile')}</div>

        <div className="mx-auto mt-8 max-w-[980px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 lg:mt-0">
          <ArticleCover
            post={post}
            sizes="(min-width: 1024px) 980px, 100vw"
            priority
            className="aspect-video"
          />
        </div>

        <div className="mx-auto mt-12 grid max-w-[980px] items-start gap-12 lg:grid-cols-[minmax(0,720px)_200px] lg:gap-14">
          <MarkdownArticle content={post.content} />

          <aside aria-label="Article information" className="hidden lg:block">
            <div className="sticky top-28">{utilityPanel('desktop')}</div>
          </aside>
        </div>

        <div className="mx-auto mt-14 max-w-[980px] border-t border-slate-200 pt-7">
          <Link
            href="/blog"
            className="inline-flex rounded-sm text-sm font-semibold text-[#184aa2] hover:underline focus-visible:outline-[#1B1F87]"
          >
            Browse more Career Insights →
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BlogPage
