'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { LuPlus } from 'react-icons/lu'
import { toast } from 'sonner'

import BlogDeleteModal from '@/components/admin-blog/BlogDeleteModal'
import PaginationControls from '@/components/PaginationControls'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import {
  BLOG_CATEGORIES,
  BLOG_STATUSES,
  type BlogCategory,
} from '@/constants/enums'
import {
  useAdminBlogPosts,
  useDeleteBlogPost,
  useUpdateBlogPost,
} from '@/hooks/useBlog'
import type {
  AdminBlogSort,
  AdminBlogStatusFilter,
  BlogPost,
} from '@/types/types'
import { formatDateInTimeZone } from '@/utils/dateTime'

const SORTS: AdminBlogSort[] = ['newest', 'oldest', 'updated', 'title']
const statusCounts = {
  all: 0,
  draft: 0,
  published: 0,
}

const positivePage = (value: string | null) => {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1
}

const BlogDirectory = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { timeZone } = usePlatformSettings()
  const rawStatus = searchParams.get('status')
  const rawCategory = searchParams.get('category')
  const rawSort = searchParams.get('sort')
  const status: AdminBlogStatusFilter = rawStatus
    && BLOG_STATUSES.includes(rawStatus as (typeof BLOG_STATUSES)[number])
    ? rawStatus as AdminBlogStatusFilter
    : 'all'
  const category = rawCategory
    && BLOG_CATEGORIES.includes(rawCategory as BlogCategory)
    ? rawCategory as BlogCategory
    : 'all'
  const sort: AdminBlogSort = rawSort && SORTS.includes(rawSort as AdminBlogSort)
    ? rawSort as AdminBlogSort
    : 'newest'
  const page = positivePage(searchParams.get('page'))
  const urlSearch = searchParams.get('search') || ''
  const searchTimer = useRef<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)

  const updateParams = useCallback((
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(queryString)
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    if (resetPage) params.delete('page')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, queryString, router])

  useEffect(() => () => {
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current)
  }, [])

  const searchChanged = (value: string) => {
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      const next = value.trim()
      if (next !== urlSearch && (!next || next.length >= 3)) {
        updateParams({ search: next || undefined })
      }
    }, 350)
  }

  const postsQuery = useAdminBlogPosts({
    page,
    limit: 20,
    search: urlSearch || undefined,
    status,
    category,
    sort,
  })
  const updatePost = useUpdateBlogPost()
  const deletePost = useDeleteBlogPost()
  const posts = postsQuery.data?.data ?? []
  const summary = postsQuery.data?.summary ?? statusCounts

  useEffect(() => {
    const totalPages = postsQuery.data?.pagination.totalPages
    if (totalPages && page > totalPages) {
      updateParams({ page: String(totalPages) }, false)
    }
  }, [page, postsQuery.data?.pagination.totalPages, updateParams])

  const changeStatus = async (post: BlogPost) => {
    const nextStatus = post.status === 'Published' ? 'Draft' : 'Published'
    if (
      post.status === 'Published'
      && !window.confirm('Move this article to Draft? It will immediately leave Career Insights.')
    ) return
    try {
      await updatePost.mutateAsync({
        postId: post._id,
        version: post.__v ?? 0,
        status: nextStatus,
      })
      toast.success(nextStatus === 'Published' ? 'Article published' : 'Article moved to Draft')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update article')
    }
  }

  const confirmDelete = async (confirmationTitle: string) => {
    if (!deleteTarget) return
    try {
      await deletePost.mutateAsync({
        postId: deleteTarget._id,
        confirmationTitle,
        version: deleteTarget.__v ?? 0,
      })
      toast.success('Article permanently deleted')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete article')
    }
  }

  const formatDate = (value: string) => formatDateInTimeZone(value, timeZone)

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Blog</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and manage articles published to Career Insights.
          </p>
        </div>
        <Link
          href="/admin-center/blog/create"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#184aa2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123d88]"
        >
          <LuPlus aria-hidden="true" />
          New article
        </Link>
      </div>

      <section aria-label="Blog directory controls" className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="relative">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <label htmlFor="blog-search" className="sr-only">Search articles</label>
            <input
              key={urlSearch}
              id="blog-search"
              type="search"
              defaultValue={urlSearch}
              onChange={(event) => searchChanged(event.target.value)}
              placeholder="Search title, excerpt or slug…"
              className="min-h-11 w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm"
            />
          </div>
          <label className="sr-only" htmlFor="blog-category">Category</label>
          <select
            id="blog-category"
            value={category}
            onChange={(event) => updateParams({
              category: event.target.value === 'all' ? undefined : event.target.value,
            })}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="all">All categories</option>
            {BLOG_CATEGORIES.map((option) => <option key={option}>{option}</option>)}
          </select>
          <label className="sr-only" htmlFor="blog-sort">Sort articles</label>
          <select
            id="blog-sort"
            value={sort}
            onChange={(event) => updateParams({
              sort: event.target.value === 'newest' ? undefined : event.target.value,
            })}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="updated">Recently updated</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <nav aria-label="Article status" className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-4">
          {([
            ['all', 'All', summary.all],
            ['Draft', 'Drafts', summary.draft],
            ['Published', 'Published', summary.published],
          ] as const).map(([value, label, count]) => {
            const active = status === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => updateParams({ status: value === 'all' ? undefined : value })}
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                  active ? 'bg-[#eaf1fb] text-[#184aa2]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label} <span className="ml-1 text-xs">{count}</span>
              </button>
            )
          })}
        </nav>
      </section>

      <div aria-live="polite" className="text-sm text-slate-600">
        {postsQuery.data
          ? `${postsQuery.data.pagination.total.toLocaleString()} article${postsQuery.data.pagination.total === 1 ? '' : 's'}`
          : 'Loading articles…'}
      </div>

      {postsQuery.isLoading ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Loading articles…
        </div>
      ) : postsQuery.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-900">Articles could not be loaded.</p>
          <button type="button" onClick={() => postsQuery.refetch()} className="mt-3 text-sm font-semibold text-red-800 underline">
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-950">
            {summary.all === 0 ? 'No articles yet' : 'No matching articles'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {summary.all === 0
              ? 'Create the first Career Insights article.'
              : 'Change or clear the current search and filters.'}
          </p>
        </div>
      ) : (
        <section aria-label="Articles" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post._id} className="align-top hover:bg-slate-50/70">
                    <td className="max-w-xl px-4 py-4">
                      <Link href={`/admin-center/blog/${post._id}/edit`} className="font-semibold text-slate-950 hover:text-[#184aa2] hover:underline">
                        {post.title}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{post.excerpt}</p>
                      <span className="mt-2 inline-block text-xs font-medium text-slate-600">{post.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        post.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{post.postedBy.name}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(post.updatedAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-3 whitespace-nowrap">
                        {post.status === 'Published' ? (
                          <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-[#184aa2] hover:underline">
                            View live
                          </Link>
                        ) : null}
                        <Link href={`/admin-center/blog/${post._id}/edit`} className="font-medium text-[#184aa2] hover:underline">
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={updatePost.isPending}
                          onClick={() => changeStatus(post)}
                          className="font-medium text-slate-700 hover:underline disabled:opacity-50"
                        >
                          {post.status === 'Published' ? 'Move to draft' : 'Publish'}
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(post)} className="font-medium text-red-700 hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {posts.map((post) => (
              <article key={post._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/admin-center/blog/${post._id}/edit`} className="font-semibold text-slate-950">
                      {post.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{post.category}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{post.status}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Updated {formatDate(post.updatedAt)} by {post.postedBy.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <Link href={`/admin-center/blog/${post._id}/edit`} className="font-semibold text-[#184aa2]">Edit</Link>
                  {post.status === 'Published' ? (
                    <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#184aa2]">View live</Link>
                  ) : null}
                  <button type="button" onClick={() => changeStatus(post)} className="font-semibold text-slate-700">
                    {post.status === 'Published' ? 'Move to draft' : 'Publish'}
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(post)} className="font-semibold text-red-700">Delete</button>
                </div>
              </article>
            ))}
          </div>
          <PaginationControls
            pagination={postsQuery.data?.pagination}
            onPageChange={(nextPage) => updateParams(
              { page: nextPage === 1 ? undefined : String(nextPage) },
              false,
            )}
          />
        </section>
      )}

      <BlogDeleteModal
        key={deleteTarget?._id || 'no-delete-target'}
        post={deleteTarget}
        pending={deletePost.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default BlogDirectory
