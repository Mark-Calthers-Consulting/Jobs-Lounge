import { BlogPageProps } from '@/types/types'
import ReactMarkdown from 'react-markdown';


const getSingleBlogPost = async (slug: string) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog/${slug}`,
        { cache: 'no-store' }
    )

    if (!res.ok) {
        console.log(res)
        throw new Error('Failed to fetch job')
    }

    const post = await res.json()
    console.log(post)
    return post.data[0]
}

const BlogPage = async ({ params }: BlogPageProps) => {
    const { slug } = await params
    console.log(slug)
    const post = await getSingleBlogPost(slug)
    console.log(post)

    const baseUrl = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';
    const currentUrl = `${baseUrl}/blog/${slug}`;
    const encodedUrl = encodeURIComponent(currentUrl);

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
