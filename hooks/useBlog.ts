import {
    createBlogPost,
    deleteBlogPost,
    fetchAdminBlogPost,
    fetchAdminBlogPosts,
    getAllBlogPosts,
    updateBlogPost,
} from '@/api/blog'
import type { AdminBlogFilters, BlogPost } from '@/types/types'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

export const useGetBlogPosts = (page = 1, limit = 20) => useQuery({
    queryKey: ['blogPosts', page, limit],
    queryFn: () => getAllBlogPosts(page, limit),
})

export const useAdminBlogPosts = (filters: AdminBlogFilters = {}) => useQuery({
    queryKey: ['adminBlogPosts', filters],
    queryFn: () => fetchAdminBlogPosts(filters),
})

export const useAdminBlogPost = (postId: string) => useQuery({
    queryKey: ['adminBlogPost', postId],
    queryFn: () => fetchAdminBlogPost(postId),
    enabled: Boolean(postId),
})

const invalidateBlogQueries = (
    queryClient: QueryClient,
    post?: BlogPost,
) => {
    if (post) queryClient.setQueryData(['adminBlogPost', post._id], post)
    queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] })
    queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
}

export const useCreateBlogPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createBlogPost,
        onSuccess: (post) => invalidateBlogQueries(queryClient, post),
    })
}

export const useUpdateBlogPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateBlogPost,
        onSuccess: (post) => invalidateBlogQueries(queryClient, post),
    })
}

export const useDeleteBlogPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteBlogPost,
        onSuccess: (_result, input) => {
            queryClient.removeQueries({ queryKey: ['adminBlogPost', input.postId] })
            invalidateBlogQueries(queryClient)
        },
    })
}
