'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiBookOpen, FiGrid, FiList } from 'react-icons/fi'

import ArticleCover from '@/components/ArticleCover'
import { Container } from '@/components/Container'
import PaginationControls from '@/components/PaginationControls'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { useGetBlogPosts } from '@/hooks/useBlog'
import type { BlogPostSummary } from '@/types/types'
import { formatDateInTimeZone } from '@/utils/dateTime'

type ListingView = 'grid' | 'list'

const publishedDate = (post: BlogPostSummary) => post.publishedAt || post.createdAt

const ArticleMetadata = ({ post }: { post: BlogPostSummary }) => {
  const { timeZone } = usePlatformSettings()
  const date = publishedDate(post)
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
      <span className="font-semibold text-[#184aa2]">{post.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={date}>
        {formatDateInTimeZone(date, timeZone, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </time>
    </div>
  )
}

const ArticleGridCard = ({ post, priority }: { post: BlogPostSummary; priority: boolean }) => (
  <article className="flex min-h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
    <ArticleCover
      post={post}
      sizes="(min-width: 1280px) 390px, (min-width: 768px) 46vw, 100vw"
      priority={priority}
      className="aspect-[16/9]"
    />
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <ArticleMetadata post={post} />
      <Link
        href={`/blog/${post.slug}`}
        className="group mt-3 flex flex-1 flex-col rounded-sm focus-visible:outline-[#1B1F87]"
      >
        <h2 className="text-xl font-bold leading-7 text-[#101A35] transition-colors group-hover:text-[#184aa2]">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
        <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#184aa2]">
          Read article <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </Link>
      <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
        By {post.postedBy.name}
      </p>
    </div>
  </article>
)

const ArticleListRow = ({ post, priority }: { post: BlogPostSummary; priority: boolean }) => (
  <article className="grid gap-5 border-t border-slate-200 py-7 first:border-t-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
    <ArticleCover
      post={post}
      sizes="(min-width: 1024px) 280px, (min-width: 768px) 240px, 100vw"
      priority={priority}
      className="aspect-[16/9] rounded-xl"
    />
    <div className="self-center">
      <ArticleMetadata post={post} />
      <Link
        href={`/blog/${post.slug}`}
        className="group mt-3 block rounded-sm focus-visible:outline-[#1B1F87]"
      >
        <h2 className="text-2xl font-bold leading-8 text-[#101A35] transition-colors group-hover:text-[#184aa2]">
          {post.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
          {post.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center text-sm font-semibold text-[#184aa2]">
          Read article <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </Link>
      <p className="mt-4 text-xs text-slate-500">By {post.postedBy.name}</p>
    </div>
  </article>
)

const ListingSkeleton = ({ view }: { view: ListingView }) => (
  <div
    role="status"
    aria-label="Loading career insights"
    className={view === 'grid' ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'space-y-2'}
  >
    {Array.from({ length: view === 'grid' ? 6 : 4 }, (_, index) => (
      <div
        key={index}
        className={view === 'grid'
          ? 'overflow-hidden rounded-xl border border-slate-200'
          : 'grid gap-5 border-t border-slate-200 py-7 first:border-t-0 md:grid-cols-[240px_1fr]'}
      >
        <div className="aspect-video animate-pulse rounded-lg bg-slate-100" />
        <div className={view === 'grid' ? 'space-y-3 p-5' : 'space-y-3 self-center'}>
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-6 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    ))}
    <span className="sr-only">Loading articles…</span>
  </div>
)

const CareerInsightsListing = () => {
  const [page, setPage] = useState(1)
  const [view, setView] = useState<ListingView>('grid')
  const { data, isLoading, isError, refetch } = useGetBlogPosts(page)
  const total = data?.pagination.total || 0

  return (
    <>
      <section className="border-b border-[#dce6f1] bg-[#f0f5fb] py-8 sm:py-10">
        <Container className="text-center">
          <p className="text-sm font-semibold text-[#184aa2]">Career insights</p>
          <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-bold tracking-[-0.025em] text-[#101A35] sm:text-4xl">
            Practical guidance for your next career move
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Clear advice on job searching, applications, interviews, growth, and the modern workplace.
          </p>
        </Container>
      </section>

      <Container className="py-8 sm:py-10">
        <div className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#101A35]">Latest articles</h2>
            <p className="mt-1 text-sm text-slate-500" aria-live="polite">
              {isLoading ? 'Loading articles…' : `${total} ${total === 1 ? 'article' : 'articles'}`}
            </p>
          </div>
          <div className="inline-flex w-fit rounded-lg border border-slate-300 bg-white p-1" role="group" aria-label="Article layout">
            {([
              { value: 'grid' as const, label: 'Grid', icon: FiGrid },
              { value: 'list' as const, label: 'List', icon: FiList },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={`${label} view`}
                aria-pressed={view === value}
                title={`${label} view`}
                onClick={() => setView(value)}
                className={`inline-flex size-9 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                  view === value ? 'bg-[#101A35] text-white' : 'text-slate-600 hover:text-[#101A35]'
                }`}
              >
                <Icon aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">{view === 'grid' ? 'Grid view selected' : 'List view selected'}</p>
        </div>

        {isLoading ? <ListingSkeleton view={view} /> : null}
        {isError ? (
          <div role="alert" className="border-y border-red-200 py-12 text-center">
            <h2 className="text-lg font-bold text-slate-950">Career insights are unavailable right now.</h2>
            <p className="mt-2 text-sm text-slate-600">Please try loading the articles again.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 min-h-10 rounded-md bg-[#184aa2] px-4 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : null}
        {!isLoading && !isError && data?.data.length === 0 ? (
          <div className="border-y border-slate-200 py-16 text-center">
            <FiBookOpen aria-hidden="true" className="mx-auto text-3xl text-slate-400" />
            <h2 className="mt-4 text-xl font-bold text-[#101A35]">New guidance is on the way</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Check back soon for practical career articles and workplace insights.
            </p>
          </div>
        ) : null}
        {!isLoading && !isError && data?.data.length ? (
          <div
            aria-label="Career insight articles"
            className={view === 'grid'
              ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3'
              : 'divide-y-0'}
          >
            {data.data.map((post, index) => view === 'grid'
              ? <ArticleGridCard key={post._id} post={post} priority={page === 1 && index < 3} />
              : <ArticleListRow key={post._id} post={post} priority={page === 1 && index === 0} />)}
          </div>
        ) : null}

        <div className="mt-10">
          <PaginationControls pagination={data?.pagination} onPageChange={setPage} />
        </div>
      </Container>
    </>
  )
}

export default CareerInsightsListing
