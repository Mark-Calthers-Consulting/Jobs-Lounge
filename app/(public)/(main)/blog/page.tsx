'use client'
import { useGetBlogPosts } from "@/hooks/useBlog";
import Link from "next/link";
import { useState } from "react";
import PaginationControls from "@/components/PaginationControls";

const Blog: React.FC = () => {
    const [page, setPage] = useState(1)
    const { data, isLoading, isError } = useGetBlogPosts(page)
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Blog posts</h1>

            {isLoading && <p role="status">Loading blog posts…</p>}
            {isError && <p role="alert" className="text-red-700">Unable to load blog posts.</p>}
            <div aria-busy={isLoading} className="flex flex-col gap-3 py-5">
                {data?.data.map((post) => (
                    <article key={post._id} className="p-3 rounded border shadow border-[#e9e9e9] space-y-3">
                        <h2 className="font-semibold text-xl">{post.title}</h2>
                        <p className="text-sm text-gray-600">{post.content.slice(0, 100)}...</p>
                        <div className="">
                            <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}</time>
                        </div>
                        <Link className="inline-block underline" href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>Read more</Link>
                    </article>
                ))}
            </div>
            <PaginationControls pagination={data?.pagination} onPageChange={setPage} />
        </div>
    )
}

export default Blog 
