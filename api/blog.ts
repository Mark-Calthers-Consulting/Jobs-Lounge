export const getAllBlogPosts = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blog`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch blog posts")
    }

    const posts = await res.json()
    return posts.data
}

export const createBlogPost = async (post: {}) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blog/create`,
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