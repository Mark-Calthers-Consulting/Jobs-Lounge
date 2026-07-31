import BlogEditor from '@/components/admin-blog/BlogEditor'

type EditBlogArticlePageProps = {
  params: Promise<{ postId: string }>
}

export default async function EditBlogArticlePage({ params }: EditBlogArticlePageProps) {
  const { postId } = await params
  return <BlogEditor postId={postId} />
}
