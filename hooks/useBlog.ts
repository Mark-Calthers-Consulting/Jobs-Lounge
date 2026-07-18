import { createBlogPost, getAllBlogPosts } from "@/api/blog"
import { useMutation, useQuery } from "@tanstack/react-query"


export const useGetBlogPosts = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['blogPosts', page, limit],
        queryFn: () => getAllBlogPosts(page, limit)
    })
}

export const useCreateBlogPost = () => {
    return useMutation({
        mutationFn: createBlogPost
    })
}
