import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BlogEditor from './BlogEditor'

const { createPost, updatePost, deletePost } = vi.hoisted(() => ({
  createPost: {
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  },
  updatePost: {
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  },
  deletePost: {
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/hooks/useBlog', () => ({
  useAdminBlogPost: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateBlogPost: () => createPost,
  useUpdateBlogPost: () => updatePost,
  useDeleteBlogPost: () => deletePost,
}))

describe('BlogEditor clear form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires confirmation before clearing every article field', () => {
    render(<BlogEditor />)

    const title = screen.getByLabelText(/Title/)
    const category = screen.getByLabelText(/Category/)
    const excerpt = screen.getByLabelText('Excerpt')
    const content = screen.getByLabelText(/Article content/)

    fireEvent.change(title, { target: { value: 'A useful article' } })
    fireEvent.change(category, { target: { value: 'Career growth' } })
    fireEvent.change(excerpt, { target: { value: 'A concise introduction.' } })
    fireEvent.change(content, { target: { value: '## Start here\n\nUseful guidance.' } })

    fireEvent.click(screen.getByRole('button', { name: 'Clear form' }))
    const dialog = screen.getByRole('dialog', { name: 'Clear article form?' })

    expect(title).toHaveValue('A useful article')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(title).toHaveValue('A useful article')

    fireEvent.click(screen.getByRole('button', { name: 'Clear form' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Clear form' }))

    expect(title).toHaveValue('')
    expect(category).toHaveValue('General')
    expect(excerpt).toHaveValue('')
    expect(content).toHaveValue('')
    expect(screen.getByLabelText('URL slug')).toHaveValue('')
  })
})
