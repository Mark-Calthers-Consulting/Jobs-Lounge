import { csrfFetch } from "./csrf"
import { apiPath } from "./base"
import type { ApiSuccess, BlogPost, CreateBlogPostPayload, PaginatedResponse } from '@/types/types'

export const getAllBlogPosts = async (page = 1, limit = 20): Promise<PaginatedResponse<BlogPost>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${apiPath('/blog')}?${params}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch blog posts")
    }

    return res.json() as Promise<PaginatedResponse<BlogPost>>
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
    if (!res.ok) {
        throw new Error("Failed to create blog post")
    }

    const blogPost = await res.json() as ApiSuccess<BlogPost>
    return blogPost.data
}
