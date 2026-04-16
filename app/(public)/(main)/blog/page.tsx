'use client'
import { useGetBlogPosts } from "@/hooks/useBlog";
import Link from "next/link";
import { IoLocation } from "react-icons/io5";
import { IoMail } from "react-icons/io5";

const Blog: React.FC = () => {
    const { data } = useGetBlogPosts()
    console.log(data)
    return (
        <div className="max-w-7xl mx-auto">
            <h1>Blog Posts</h1>

            {/* #TODO change type from any */}
            <div className="flex flex-col gap-3 py-5">
                {data?.map((post: any, index: number) => (
                    <div className="p-3 rounded border shadow border-[#e9e9e9] space-y-3">
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
        </div>
    )
}

export default Blog 