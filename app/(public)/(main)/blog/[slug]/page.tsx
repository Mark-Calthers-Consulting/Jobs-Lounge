import type { ApiSuccess, BlogPageProps, BlogPost } from '@/types/types'
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { serverApiUrl } from '@/api/serverBase';


const getSingleBlogPost = async (slug: string): Promise<BlogPost> => {
    const res = await fetch(
        serverApiUrl(`/blog/${encodeURIComponent(slug)}`),
        { cache: 'no-store' }
    )

    if (res.status === 404) {
        notFound()
    }

    if (!res.ok) {
        throw new Error('Failed to fetch post')
    }

    const post = await res.json() as ApiSuccess<BlogPost>
    return post.data
}

const BlogPage = async ({ params }: BlogPageProps) => {
    const { slug } = await params
    const post = await getSingleBlogPost(slug)

    return (
        <div className=" prose prose-lg max-w-7xl mx-auto">
            <article>
                <h1 className='font-semibold py-4'>{post.title}</h1>
                <div className="max-w-none text-gray-800">
                    <ReactMarkdown>
                        {post.content}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    )
}

export default BlogPage
