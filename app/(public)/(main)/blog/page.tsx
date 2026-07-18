'use client'
import { useGetBlogPosts } from "@/hooks/useBlog";
import Link from "next/link";
import { useState } from "react";
import PaginationControls from "@/components/PaginationControls";

const Blog: React.FC = () => {
    const [page, setPage] = useState(1)
    const { data } = useGetBlogPosts(page)
    return (
        <div className="max-w-7xl mx-auto">
            <h1>Blog Posts</h1>

            <div className="flex flex-col gap-3 py-5">
                {data?.data.map((post) => (
                    <div key={post._id} className="p-3 rounded border shadow border-[#e9e9e9] space-y-3">
                        <h2 className="font-semibold text-xl">{post.title}</h2>
                        <p className="text-sm text-[#797979]">{post.content.slice(0, 100)}...</p>
                        <div className="">
                            <p>{new Date(post.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}</p>
                        </div>
                        <Link href={`/blog/${post.slug}`}>
                            <button>Read more</button>
                        </Link>
                    </div>
                ))}
            </div>
            <PaginationControls pagination={data?.pagination} onPageChange={setPage} />
        </div>
    )
}

export default Blog 
