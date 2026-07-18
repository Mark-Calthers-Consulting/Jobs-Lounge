import { csrfFetch } from "./csrf"

export const getAllBlogPosts = async (page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blog?${params}`,
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
// MAKING THE API CALL DIRECTLY IN THE COMPONENT
// export const getSingleBlogPost = async (slug) => {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blog/${slug}`,
//         {
//             method: 'GET',
//             credentials: 'include'
//         }
//     )
//     if (!res.ok) {
//         throw new Error("Failed to fetch blog posts")
//     }

//     const posts = await res.json()
//     return posts.data
// }

export const createBlogPost = async (post: {}) => {
    const res = await csrfFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blog/create`,
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
