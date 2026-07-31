import { csrfFetch } from './csrf'
import { apiPath } from './base'
import type {
    AdminBlogFilters,
    AdminBlogResponse,
    ApiSuccess,
    BlogPost,
    BlogPostSummary,
    CreateBlogPostPayload,
    DeleteBlogPostPayload,
    PaginatedResponse,
    UpdateBlogPostPayload,
} from '@/types/types'
import { readApiResponse } from './errors'

export const getAllBlogPosts = async (
    page = 1,
    limit = 20,
): Promise<PaginatedResponse<BlogPostSummary>> => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        summary: 'true',
    })
    const res = await fetch(`${apiPath('/blog')}?${params}`, {
        method: 'GET',
        credentials: 'include',
    })
    return readApiResponse<PaginatedResponse<BlogPostSummary>>(res, 'Failed to fetch blog posts')
}

const blogFormData = (payload: object) => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) return
        if (key === 'coverImageFile' && value instanceof File) {
            formData.set('coverImage', value)
            return
        }
        formData.set(key, String(value))
    })
    return formData
}

export const fetchAdminBlogPosts = async (
    filters: AdminBlogFilters = {},
): Promise<AdminBlogResponse> => {
    const params = new URLSearchParams()
    Object.entries({
        page: 1,
        limit: 20,
        status: 'all',
        sort: 'newest',
        ...filters,
    }).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
            params.set(key, String(value))
        }
    })
    const res = await fetch(`${apiPath('/admin/blog')}?${params}`, {
        credentials: 'include',
        cache: 'no-store',
    })
    return readApiResponse<AdminBlogResponse>(res, 'Unable to load articles')
}

export const fetchAdminBlogPost = async (postId: string): Promise<BlogPost> => {
    const res = await fetch(apiPath(`/admin/blog/${encodeURIComponent(postId)}`), {
        credentials: 'include',
        cache: 'no-store',
    })
    const result = await readApiResponse<ApiSuccess<BlogPost>>(res, 'Unable to load article')
    return result.data
}

export const createBlogPost = async (
    post: CreateBlogPostPayload,
): Promise<BlogPost> => {
    const res = await csrfFetch(apiPath('/admin/blog'), {
        method: 'POST',
        body: blogFormData(post),
    })
    const result = await readApiResponse<ApiSuccess<BlogPost>>(res, 'Unable to create article')
    return result.data
}

export const updateBlogPost = async ({
    postId,
    version,
    ...updates
}: UpdateBlogPostPayload): Promise<BlogPost> => {
    const res = await csrfFetch(apiPath(`/admin/blog/${encodeURIComponent(postId)}`), {
        method: 'PATCH',
        body: blogFormData({ ...updates, version }),
    })
    const result = await readApiResponse<ApiSuccess<BlogPost>>(res, 'Unable to update article')
    return result.data
}

export const deleteBlogPost = async ({
    postId,
    confirmationTitle,
    version,
}: DeleteBlogPostPayload): Promise<{ deleted: true; postId: string }> => {
    const res = await csrfFetch(apiPath(`/admin/blog/${encodeURIComponent(postId)}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationTitle, version }),
    })
    const result = await readApiResponse<ApiSuccess<{ deleted: true; postId: string }>>(
        res,
        'Unable to delete article',
    )
    return result.data
}
