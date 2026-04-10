'use client'
import { useGetBlogPosts } from "@/hooks/useBlog";
import { IoLocation } from "react-icons/io5";
import { IoMail } from "react-icons/io5";

const Blog: React.FC = () => {
    const { data } = useGetBlogPosts()
    console.log(data)
    return (
        <div className="max-w-7xl mx-auto">
            <h1>Blog Page</h1>
        </div>
    )
}

export default Blog