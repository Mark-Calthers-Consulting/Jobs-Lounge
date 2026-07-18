import { csrfFetch } from "./csrf"
import { apiPath } from "./base"

export const getAllBlogPosts = async (page = 1, limit = 20) => {
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

    return res.json()
}
export const createBlogPost = async (post: Record<string, unknown>) => {
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

    const blogPost = await res.json()
    return blogPost.data
}
