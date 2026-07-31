import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import BlogDeleteModal from './BlogDeleteModal'
import type { BlogPost } from '@/types/types'

const post: BlogPost = {
  _id: 'post-id',
  title: 'A careful article title',
  slug: 'a-careful-article-title',
  excerpt: 'A useful summary.',
  category: 'Career growth',
  content: 'Article content',
  status: 'Published',
  postedBy: { name: 'Mariam Azeez' },
  publishedAt: '2026-04-11T10:00:00.000Z',
  createdAt: '2026-04-11T10:00:00.000Z',
  updatedAt: '2026-04-11T10:00:00.000Z',
  __v: 2,
}

describe('permanent article deletion', () => {
  it('requires the exact article title and retains a separate cancel action', () => {
    const confirm = vi.fn()
    const close = vi.fn()
    render(
      <BlogDeleteModal
        post={post}
        pending={false}
        onClose={close}
        onConfirm={confirm}
      />,
    )

    const deleteButton = screen.getByRole('button', { name: 'Delete permanently' })
    expect(deleteButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Type the complete article title'), {
      target: { value: post.title },
    })
    expect(deleteButton).toBeEnabled()
    fireEvent.click(deleteButton)
    expect(confirm).toHaveBeenCalledWith(post.title)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(close).toHaveBeenCalled()
  })
})
