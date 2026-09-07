'use client'

import Link from 'next/link'
import { FiArrowRight, FiBookOpen, FiRefreshCw } from 'react-icons/fi'

import ArticleCover from '@/components/ArticleCover'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { useGetBlogPosts } from '@/hooks/useBlog'
import type { BlogPostSummary } from '@/types/types'
import { formatDateInTimeZone } from '@/utils/dateTime'

const articleDate = (post: BlogPostSummary) => post.publishedAt || post.createdAt

const ArticleMeta = ({ post }: { post: BlogPostSummary }) => {
  const { timeZone } = usePlatformSettings()
  const date = articleDate(post)

  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span className="font-semibold text-[#e23845]">{post.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={date}>
        {formatDateInTimeZone(date, timeZone, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </time>
    </p>
  )
}

const FeaturedArticle = ({ post }: { post: BlogPostSummary }) => (
  <article className="grid overflow-hidden border-y border-slate-200 md:grid-cols-[1.02fr_0.98fr] md:border">
    <ArticleCover
      post={post}
      sizes="(min-width: 1024px) 390px, (min-width: 768px) 50vw, 100vw"
      className="min-h-[260px] md:min-h-full"
    />
    <div className="flex flex-col justify-center px-1 py-7 md:px-8 lg:px-10">
      <ArticleMeta post={post} />
      <h3 className="font-editorial mt-4 text-3xl font-normal leading-tight text-[#101A35]">{post.title}</h3>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
      <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline">
        Read article <FiArrowRight aria-hidden="true" />
      </Link>
    </div>
  </article>
)

const CompactArticle = ({ post }: { post: BlogPostSummary }) => (
  <article className="grid grid-cols-[128px_1fr] gap-5 border-t border-slate-200 py-5 first:border-t-0 sm:grid-cols-[170px_1fr] lg:grid-cols-[145px_1fr]">
    <ArticleCover
      post={post}
      sizes="(min-width: 1024px) 145px, (min-width: 640px) 170px, 128px"
      className="aspect-[4/3]"
    />
    <div className="self-center">
      <ArticleMeta post={post} />
      <h3 className="font-editorial mt-2 line-clamp-2 text-xl font-normal leading-6 text-[#101A35]">{post.title}</h3>
      <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#184aa2] hover:underline">
        Read article <FiArrowRight aria-hidden="true" />
      </Link>
    </div>
  </article>
)

const InsightsSkeleton = () => (
  <div role="status" aria-label="Loading career insights" className="grid animate-pulse gap-7 lg:grid-cols-[1.35fr_0.65fr]">
    <div className="grid overflow-hidden border border-slate-200 md:grid-cols-2">
      <div className="min-h-72 bg-slate-100" />
      <div className="space-y-4 p-8">
        <div className="h-3 w-32 bg-slate-100" />
        <div className="h-8 w-4/5 bg-slate-200" />
        <div className="h-4 w-full bg-slate-100" />
        <div className="h-4 w-2/3 bg-slate-100" />
      </div>
    </div>
    <div className="space-y-5">
      <div className="h-32 bg-slate-100" />
      <div className="h-32 bg-slate-100" />
    </div>
    <span className="sr-only">Loading articles…</span>
  </div>
)

export default function HomepageCareerInsights() {
  const query = useGetBlogPosts(1, 3)
  const posts = query.data?.data.slice(0, 3) ?? []

  return (
    <section aria-labelledby="homepage-insights-heading" className="border-t border-slate-200 bg-[#fbfcfe] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="h-9 w-0.5 bg-[#e23845]" />
            <h2 id="homepage-insights-heading" className="font-editorial text-3xl font-normal text-[#101A35] sm:text-[2rem]">
              Career Insights
            </h2>
          </div>
          <Link href="/blog" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline">
            View all articles <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7" aria-busy={query.isLoading}>
          {query.isLoading ? <InsightsSkeleton /> : null}
          {query.isError ? (
            <div className="border-y border-slate-200 py-9 text-center">
              <p role="alert" className="text-sm text-slate-600">Career insights could not be loaded.</p>
              <button type="button" onClick={() => void query.refetch()} className="mt-4 inline-flex min-h-10 items-center gap-2 border border-slate-300 px-4 text-sm font-semibold text-[#101A35] hover:bg-white">
                <FiRefreshCw aria-hidden="true" /> Try again
              </button>
            </div>
          ) : null}
          {!query.isLoading && !query.isError && posts.length === 0 ? (
            <div className="border-y border-slate-200 py-10 text-center">
              <FiBookOpen aria-hidden="true" className="mx-auto text-2xl text-slate-400" />
              <h3 className="mt-3 font-semibold text-[#101A35]">Fresh career guidance is on the way</h3>
              <p className="mt-2 text-sm text-slate-600">Check back soon for practical articles and workplace insights.</p>
            </div>
          ) : null}
          {!query.isLoading && !query.isError && posts.length > 0 ? (
            <div className={`grid gap-7 ${posts.length > 1 ? 'lg:grid-cols-[1.35fr_0.65fr]' : ''}`}>
              <FeaturedArticle post={posts[0]} />
              {posts.length > 1 ? (
                <div className="self-center">
                  {posts.slice(1).map((post) => <CompactArticle key={post._id} post={post} />)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
