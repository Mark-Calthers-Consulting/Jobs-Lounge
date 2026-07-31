import type { ApiSuccess, BlogPageProps, BlogPost } from '@/types/types'
import { notFound } from 'next/navigation';
import { serverApiUrl } from '@/api/serverBase';
import { readApiResponse } from '@/api/errors';
import MarkdownArticle from '@/components/MarkdownArticle';


const getSingleBlogPost = async (slug: string): Promise<BlogPost> => {
    const res = await fetch(
        serverApiUrl(`/blog/${encodeURIComponent(slug)}`),
        { cache: 'no-store' }
    )

    if (res.status === 404) {
        notFound()
    }

    const post = await readApiResponse<ApiSuccess<BlogPost>>(res, 'Failed to fetch post')
    return post.data
}

const BlogPage = async ({ params }: BlogPageProps) => {
    const { slug } = await params
    const post = await getSingleBlogPost(slug)

    return (
        <div className=" prose prose-lg max-w-7xl mx-auto">
            <article>
                <h1 className='font-semibold py-4'>{post.title}</h1>
                <MarkdownArticle content={post.content} className="text-gray-800" />
            </article>
        </div>
    )
}

export default BlogPage
