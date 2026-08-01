'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import { toast } from 'sonner'

import { ApiError } from '@/api/errors'
import MarkdownArticle from '@/components/MarkdownArticle'
import Modal from '@/components/Modal'
import BlogDeleteModal from '@/components/admin-blog/BlogDeleteModal'
import BlogCoverImageField from '@/components/admin-blog/BlogCoverImageField'
import { BLOG_CATEGORIES, type BlogCategory } from '@/constants/enums'
import {
  useAdminBlogPost,
  useCreateBlogPost,
  useDeleteBlogPost,
  useUpdateBlogPost,
} from '@/hooks/useBlog'
import type { BlogPost } from '@/types/types'
import type { BlogStatus } from '@/constants/enums'
import {
  articleExcerpt,
  readImageDimensions,
  slugifyArticleTitle,
  validateBlogCoverFile,
} from '@/utils/blog'

type BlogEditorProps = {
  postId?: string
}

type BlogEditorFormProps = BlogEditorProps & {
  existing?: BlogPost
}

type FormState = {
  title: string
  slug: string
  category: BlogCategory
  excerpt: string
  content: string
  status: BlogStatus
}

type FieldName = keyof FormState | 'coverImage' | 'coverImageAlt'
type FieldErrors = Partial<Record<FieldName, string>>

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  category: 'General',
  excerpt: '',
  content: '',
  status: 'Draft',
}

const formFromPost = (post: BlogPost): FormState => ({
  title: post.title,
  slug: post.slug,
  category: post.category || 'General',
  excerpt: post.excerpt || '',
  content: post.content,
  status: post.status,
})

const validate = (form: FormState): FieldErrors => {
  const errors: FieldErrors = {}
  const title = form.title.trim()
  const slug = slugifyArticleTitle(form.slug)
  if (!title) errors.title = 'Enter an article title.'
  else if (title.length > 160) errors.title = 'Keep the title within 160 characters.'
  if (!slug) errors.slug = 'Enter a valid URL slug.'
  else if (slug.length > 120) errors.slug = 'Keep the slug within 120 characters.'
  if (!BLOG_CATEGORIES.includes(form.category)) errors.category = 'Choose a category.'
  if (form.excerpt.trim().length > 240) errors.excerpt = 'Keep the excerpt within 240 characters.'
  if (!form.content.trim()) errors.content = 'Add the article content.'
  else if (form.content.length > 100_000) errors.content = 'Keep the article within 100,000 characters.'
  return errors
}

const serverFieldErrors = (error: ApiError): FieldErrors => {
  if (!error.details || typeof error.details !== 'object') return {}
  const details = error.details as Record<string, unknown>
  const fields = Array.isArray(details.fields)
    ? details.fields
    : []
  return Object.fromEntries(fields
    .filter((field): field is FieldName => (
      typeof field === 'string'
      && (field in EMPTY_FORM || field === 'coverImage' || field === 'coverImageAlt')
    ))
    .map((field) => [field, error.message]))
}

const BlogEditorForm = ({ postId, existing }: BlogEditorFormProps) => {
  const router = useRouter()
  const createPost = useCreateBlogPost()
  const updatePost = useUpdateBlogPost()
  const deletePost = useDeleteBlogPost()
  const startingForm = existing ? formFromPost(existing) : EMPTY_FORM
  const [form, setForm] = useState<FormState>(startingForm)
  const [initialForm, setInitialForm] = useState<FormState>(startingForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [slugTouched, setSlugTouched] = useState(Boolean(existing))
  const [mobilePanel, setMobilePanel] = useState<'write' | 'preview'>('write')
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>()
  const [coverAlt, setCoverAlt] = useState(existing?.coverImage?.alt || '')
  const [initialCoverAlt, setInitialCoverAlt] = useState(existing?.coverImage?.alt || '')
  const [removeCoverImage, setRemoveCoverImage] = useState(false)
  const previewUrlRef = useRef<string | undefined>(undefined)
  const coverSelectionRef = useRef(0)

  const pending = createPost.isPending || updatePost.isPending || deletePost.isPending
  const slugLocked = Boolean(existing?.publishedAt)
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm)
    || Boolean(coverFile)
    || removeCoverImage
    || coverAlt !== initialCoverAlt
  const generatedExcerpt = useMemo(() => articleExcerpt(form.content), [form.content])
  const displayedCoverUrl = coverPreviewUrl
    || (!removeCoverImage ? existing?.coverImage?.secureUrl : undefined)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  const clearLocalCoverPreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = undefined
    setCoverPreviewUrl(undefined)
  }

  const chooseCoverImage = async (file: File) => {
    const selection = coverSelectionRef.current + 1
    coverSelectionRef.current = selection
    const basicError = validateBlogCoverFile(file)
    if (basicError) {
      setErrors((current) => ({ ...current, coverImage: basicError }))
      return
    }
    try {
      const dimensions = await readImageDimensions(file)
      if (selection !== coverSelectionRef.current) return
      const dimensionError = validateBlogCoverFile(file, dimensions)
      if (dimensionError) {
        setErrors((current) => ({ ...current, coverImage: dimensionError }))
        return
      }
      clearLocalCoverPreview()
      const previewUrl = URL.createObjectURL(file)
      previewUrlRef.current = previewUrl
      setCoverPreviewUrl(previewUrl)
      setCoverFile(file)
      setRemoveCoverImage(false)
      setErrors((current) => ({ ...current, coverImage: undefined }))
    } catch (error) {
      if (selection !== coverSelectionRef.current) return
      setErrors((current) => ({
        ...current,
        coverImage: error instanceof Error ? error.message : 'Choose a readable image.',
      }))
    }
  }

  const removeCover = () => {
    coverSelectionRef.current += 1
    clearLocalCoverPreview()
    setCoverFile(null)
    setCoverAlt('')
    setRemoveCoverImage(Boolean(existing?.coverImage))
    setErrors((current) => ({ ...current, coverImage: undefined, coverImageAlt: undefined }))
  }

  const clearForm = () => {
    coverSelectionRef.current += 1
    clearLocalCoverPreview()
    setCoverFile(null)
    setCoverAlt('')
    setRemoveCoverImage(Boolean(existing?.coverImage))
    setErrors({})
    setSlugTouched(slugLocked)
    setMobilePanel('write')
    setForm({
      ...EMPTY_FORM,
      status: existing?.status || 'Draft',
      slug: slugLocked ? form.slug : '',
    })
    setClearConfirmationOpen(false)
    window.setTimeout(() => document.getElementById('blog-title')?.focus(), 0)
  }

  const change = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'title' && !slugTouched && !slugLocked) {
        next.slug = slugifyArticleTitle(String(value))
      }
      return next
    })
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const save = async (status: BlogStatus) => {
    const nextForm = {
      ...form,
      title: form.title.trim(),
      slug: slugifyArticleTitle(form.slug || form.title),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      status,
    }
    const nextErrors = validate(nextForm)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const first = Object.keys(nextErrors)[0]
      document.getElementById(`blog-${first}`)?.focus()
      return
    }

    try {
      const saved = postId && existing
        ? await updatePost.mutateAsync({
            postId,
            version: existing.__v ?? 0,
            ...nextForm,
            ...(coverFile ? { coverImageFile: coverFile, coverImageAlt: coverAlt.trim() } : {}),
            ...(!coverFile && existing.coverImage && !removeCoverImage
              ? { coverImageAlt: coverAlt.trim() }
              : {}),
            ...(removeCoverImage ? { removeCoverImage: true } : {}),
          })
        : await createPost.mutateAsync({
            ...nextForm,
            ...(coverFile ? { coverImageFile: coverFile, coverImageAlt: coverAlt.trim() } : {}),
          })
      const savedForm = formFromPost(saved)
      clearLocalCoverPreview()
      setCoverFile(null)
      setRemoveCoverImage(false)
      setCoverAlt(saved.coverImage?.alt || '')
      setInitialCoverAlt(saved.coverImage?.alt || '')
      setForm(savedForm)
      setInitialForm(savedForm)
      setSlugTouched(true)
      toast.success(status === 'Published' ? 'Article published' : 'Draft saved')
      if (!postId) router.replace(`/admin-center/blog/${saved._id}/edit`)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(serverFieldErrors(error))
        if (error.code === 'BLOG_CONFLICT') {
          toast.error('This article changed elsewhere. Reload it before continuing.')
          return
        }
      }
      toast.error(error instanceof Error ? error.message : 'Unable to save article')
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void save(form.status)
  }

  const confirmDelete = async (confirmationTitle: string) => {
    if (!existing) return
    try {
      await deletePost.mutateAsync({
        postId: existing._id,
        confirmationTitle,
        version: existing.__v ?? 0,
      })
      toast.success('Article permanently deleted')
      setDeleteTarget(null)
      setInitialForm(form)
      router.replace('/admin-center/blog')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete article')
    }
  }

  const leaveEditor = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dirty && !window.confirm('Leave without saving your article changes?')) {
      event.preventDefault()
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/admin-center/blog" onClick={leaveEditor} className="text-sm font-medium text-[#184aa2] hover:underline">
            ← Back to Blog
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {existing ? 'Edit article' : 'New article'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Write in Markdown and review the rendered article before publishing.
          </p>
        </div>
        {existing?.status === 'Published' ? (
          <Link
            href={`/blog/${existing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#184aa2] hover:underline"
          >
            View published article ↗
          </Link>
        ) : null}
      </header>

      <div className="flex rounded-md border border-slate-200 bg-white p-1 lg:hidden" aria-label="Editor view">
        {(['write', 'preview'] as const).map((panel) => (
          <button
            key={panel}
            type="button"
            aria-pressed={mobilePanel === panel}
            onClick={() => setMobilePanel(panel)}
            className={`flex-1 rounded px-3 py-2 text-sm font-semibold capitalize ${
              mobilePanel === panel ? 'bg-[#eaf1fb] text-[#184aa2]' : 'text-slate-600'
            }`}
          >
            {panel}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <section className={`${mobilePanel === 'preview' ? 'hidden lg:block' : ''} space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6`}>
          <div>
            <label htmlFor="blog-title" className="block text-sm font-semibold text-slate-900">
              Title <span className="text-red-700">*</span>
            </label>
            <input
              id="blog-title"
              value={form.title}
              onChange={(event) => change('title', event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'blog-title-error' : undefined}
              maxLength={160}
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3"
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              {errors.title ? <p id="blog-title-error" className="text-red-700">{errors.title}</p> : <span />}
              <span className="text-slate-500">{form.title.length}/160</span>
            </div>
          </div>

          <BlogCoverImageField
            currentImage={existing?.coverImage}
            previewUrl={coverPreviewUrl}
            alt={coverAlt}
            removed={removeCoverImage}
            disabled={pending}
            error={errors.coverImage || errors.coverImageAlt}
            onChoose={(file) => void chooseCoverImage(file)}
            onAltChange={(value) => {
              setCoverAlt(value)
              setErrors((current) => ({ ...current, coverImageAlt: undefined }))
            }}
            onRemove={removeCover}
          />

          <div>
            <label htmlFor="blog-slug" className="block text-sm font-semibold text-slate-900">URL slug</label>
            <div className="mt-2 flex min-h-11 overflow-hidden rounded-md border border-slate-300 bg-white">
              <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">/blog/</span>
              <input
                id="blog-slug"
                value={form.slug}
                disabled={slugLocked}
                onChange={(event) => {
                  setSlugTouched(true)
                  change('slug', event.target.value)
                }}
                onBlur={() => change('slug', slugifyArticleTitle(form.slug))}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={errors.slug ? 'blog-slug-error' : 'blog-slug-help'}
                maxLength={120}
                className="min-w-0 flex-1 border-0 px-3 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            {errors.slug ? <p id="blog-slug-error" className="mt-1 text-xs text-red-700">{errors.slug}</p> : (
              <p id="blog-slug-help" className="mt-1 text-xs text-slate-500">
                {slugLocked
                  ? 'Locked because this article has already been published.'
                  : 'Generated from the title. You can edit it before publishing.'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="blog-category" className="block text-sm font-semibold text-slate-900">
              Category <span className="text-red-700">*</span>
            </label>
            <select
              id="blog-category"
              value={form.category}
              onChange={(event) => change('category', event.target.value as BlogCategory)}
              aria-invalid={Boolean(errors.category)}
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3"
            >
              {BLOG_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
            {errors.category ? <p className="mt-1 text-xs text-red-700">{errors.category}</p> : null}
          </div>

          <div>
            <label htmlFor="blog-excerpt" className="block text-sm font-semibold text-slate-900">Excerpt</label>
            <textarea
              id="blog-excerpt"
              rows={3}
              value={form.excerpt}
              onChange={(event) => change('excerpt', event.target.value)}
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={errors.excerpt ? 'blog-excerpt-error' : 'blog-excerpt-help'}
              maxLength={240}
              placeholder={generatedExcerpt || 'A short introduction for article listings.'}
              className="mt-2 w-full resize-y rounded-md border border-slate-300 p-3"
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              {errors.excerpt ? <p id="blog-excerpt-error" className="text-red-700">{errors.excerpt}</p> : (
                <p id="blog-excerpt-help" className="text-slate-500">Leave empty to generate it from the article.</p>
              )}
              <span className="text-slate-500">{form.excerpt.length}/240</span>
            </div>
          </div>

          <div>
            <label htmlFor="blog-content" className="block text-sm font-semibold text-slate-900">
              Article content <span className="text-red-700">*</span>
            </label>
            <textarea
              id="blog-content"
              rows={22}
              value={form.content}
              onChange={(event) => change('content', event.target.value)}
              aria-invalid={Boolean(errors.content)}
              aria-describedby={errors.content ? 'blog-content-error' : 'blog-content-help'}
              placeholder={'## Start with a clear heading\\n\\nWrite the article in Markdown.'}
              className="mt-2 w-full resize-y rounded-md border border-slate-300 p-3 font-mono text-sm leading-6"
            />
            {errors.content ? <p id="blog-content-error" className="mt-1 text-xs text-red-700">{errors.content}</p> : (
              <p id="blog-content-help" className="mt-1 text-xs text-slate-500">
                Use ## for headings, - for lists, **bold**, and [text](https://example.com) for links.
              </p>
            )}
          </div>

          {updatePost.error instanceof ApiError && updatePost.error.code === 'BLOG_CONFLICT' ? (
            <div role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              This article changed elsewhere.
              <button type="button" onClick={() => window.location.reload()} className="ml-2 font-semibold underline">
                Reload article
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap">
            {form.status === 'Published' ? (
              <>
                <button type="submit" disabled={pending} className="min-h-11 rounded-md bg-[#184aa2] px-5 text-sm font-semibold text-white disabled:opacity-60">
                  {updatePost.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm('Move this article to Draft? It will immediately leave Career Insights.')) {
                      void save('Draft')
                    }
                  }}
                  className="min-h-11 rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800"
                >
                  Move to Draft
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void save('Draft')}
                  className="min-h-11 rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800"
                >
                  {createPost.isPending || updatePost.isPending ? 'Saving…' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void save('Published')}
                  className="min-h-11 rounded-md bg-[#184aa2] px-5 text-sm font-semibold text-white"
                >
                  Publish
                </button>
              </>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => setClearConfirmationOpen(true)}
              className="min-h-11 rounded-md px-3 text-sm font-semibold text-slate-600 hover:text-slate-950 disabled:opacity-60"
            >
              Clear form
            </button>
            {existing ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => setDeleteTarget(existing)}
                className="min-h-11 rounded-md px-3 text-sm font-semibold text-red-700 sm:ml-auto"
              >
                Delete article
              </button>
            ) : null}
          </div>
        </section>

        <aside className={`${mobilePanel === 'write' ? 'hidden lg:block' : ''} lg:sticky lg:top-8`}>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
            </div>
            <article className="p-5 sm:p-7">
              {displayedCoverUrl ? (
                <div className="mb-6 overflow-hidden rounded-lg bg-slate-100">
                  {/* The native preview deliberately mirrors the centered public crop. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayedCoverUrl}
                    alt={coverAlt}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ) : null}
              <p className="text-sm font-medium text-[#184aa2]">{form.category}</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-950">
                {form.title || 'Untitled article'}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {form.excerpt.trim() || generatedExcerpt || 'Your article excerpt will appear here.'}
              </p>
              <div className="my-6 border-t border-slate-200" />
              {form.content.trim() ? (
                <MarkdownArticle content={form.content} />
              ) : (
                <p className="text-sm text-slate-500">Start writing to see the article preview.</p>
              )}
            </article>
          </div>
        </aside>
      </form>

      <Modal
        isOpen={clearConfirmationOpen}
        title="Clear article form?"
        body={(
          <p className="text-sm leading-6 text-slate-200">
            This will remove the title, category selection, excerpt, article content, and cover image
            from the form. Nothing is changed in the database until you save.
          </p>
        )}
        actionLabel="Clear form"
        actionTone="danger"
        size="compact"
        disabled={pending}
        onClose={() => setClearConfirmationOpen(false)}
        onSubmit={clearForm}
        footer={(
          <button
            type="button"
            disabled={pending}
            onClick={() => setClearConfirmationOpen(false)}
            className="w-full rounded-md border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      />

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

const BlogEditor = ({ postId }: BlogEditorProps) => {
  const postQuery = useAdminBlogPost(postId || '')

  if (postId && postQuery.isLoading) {
    return <div role="status" className="rounded-xl border border-slate-200 bg-white p-8">Loading article…</div>
  }
  if (postId && (postQuery.isError || !postQuery.data)) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-900">This article could not be loaded.</p>
        <button type="button" onClick={() => postQuery.refetch()} className="mt-3 text-sm font-semibold text-red-800 underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <BlogEditorForm
      key={postQuery.data?._id || 'new-article'}
      postId={postId}
      existing={postQuery.data}
    />
  )
}

export default BlogEditor
