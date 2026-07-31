'use client'

import { useState } from 'react'

import Modal from '@/components/Modal'
import type { BlogPost } from '@/types/types'

type BlogDeleteModalProps = {
  post: BlogPost | null
  pending: boolean
  onClose: () => void
  onConfirm: (confirmationTitle: string) => void
}

const BlogDeleteModal = ({
  post,
  pending,
  onClose,
  onConfirm,
}: BlogDeleteModalProps) => {
  const [confirmationTitle, setConfirmationTitle] = useState('')

  const matches = Boolean(post && confirmationTitle === post.title)

  return (
    <Modal
      isOpen={Boolean(post)}
      onClose={onClose}
      onSubmit={() => onConfirm(confirmationTitle)}
      title="Delete article permanently?"
      actionLabel={pending ? 'Deleting…' : 'Delete permanently'}
      actionTone="danger"
      disabled={pending}
      actionDisabled={!matches}
      size="compact"
      body={post ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-white/80">
            <strong className="text-white">{post.title}</strong> is currently{' '}
            {post.status.toLowerCase()}. Its content and public URL cannot be recovered.
          </p>
          <div>
            <label htmlFor="delete-blog-title" className="block text-sm font-medium text-white">
              Type the complete article title
            </label>
            <input
              id="delete-blog-title"
              type="text"
              autoComplete="off"
              value={confirmationTitle}
              onChange={(event) => setConfirmationTitle(event.target.value)}
              disabled={pending}
              className="mt-2 w-full rounded-md border border-white/25 bg-white px-3 py-2 text-sm text-gray-950"
            />
          </div>
        </div>
      ) : <div />}
      footer={(
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="w-full rounded-md border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
        >
          Cancel
        </button>
      )}
    />
  )
}

export default BlogDeleteModal
