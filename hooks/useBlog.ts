import { createBlogPost, getAllBlogPosts } from "@/api/blog"
import { useMutation, useQuery } from "@tanstack/react-query"


export const useGetBlogPosts = () => {
    return useQuery({
        queryKey: ['blogPosts'],
        queryFn: getAllBlogPosts
    })
}

export const useCreateBlogPost = () => {
    return useMutation({
        mutationFn: createBlogPost
    })
}