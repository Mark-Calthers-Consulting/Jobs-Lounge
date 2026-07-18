import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import type { ApiSuccess, BlogPost, CreateBlogPostPayload, PaginatedResponse } from '@/types/types'
import { readApiResponse } from './errors'

export const getAllBlogPosts = async (page = 1, limit = 20): Promise<PaginatedResponse<BlogPost>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/blog')}?${params}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    return readApiResponse<PaginatedResponse<BlogPost>>(res, 'Failed to fetch blog posts')
}
export const createBlogPost = async (post: CreateBlogPostPayload): Promise<BlogPost> => {
    const res = await csrfFetch(apiPath('/blog/create'),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(post)
        }
    )
    const blogPost = await readApiResponse<ApiSuccess<BlogPost>>(res, 'Failed to create blog post')
    return blogPost.data
}
