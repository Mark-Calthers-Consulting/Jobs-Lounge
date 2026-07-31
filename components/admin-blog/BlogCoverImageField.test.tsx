/* eslint-disable @next/next/no-img-element */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import BlogCoverImageField from './BlogCoverImageField'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

describe('blog cover image field', () => {
  it('allows a recruiter to choose an image and exposes upload guidance', () => {
    const onChoose = vi.fn()
    render(
      <BlogCoverImageField
        alt=""
        removed={false}
        disabled={false}
        onChoose={onChoose}
        onAltChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    )
    const file = new File(['cover'], 'cover.webp', { type: 'image/webp' })
    fireEvent.change(screen.getByLabelText('Cover image file'), { target: { files: [file] } })
    expect(onChoose).toHaveBeenCalledWith(file)
    expect(screen.getByText(/Maximum 5MB/)).toBeInTheDocument()
  })

  it('shows existing imagery with editable alternative text and removal', () => {
    const onAltChange = vi.fn()
    const onRemove = vi.fn()
    render(
      <BlogCoverImageField
        currentImage={{
          secureUrl: 'https://res.cloudinary.com/demo/image/upload/cover.webp',
          alt: 'Existing description',
          width: 1600,
          height: 900,
        }}
        alt="Existing description"
        removed={false}
        disabled={false}
        onChoose={vi.fn()}
        onAltChange={onAltChange}
        onRemove={onRemove}
      />,
    )
    fireEvent.change(screen.getByLabelText('Alternative text'), { target: { value: 'Updated' } })
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onAltChange).toHaveBeenCalledWith('Updated')
    expect(onRemove).toHaveBeenCalled()
  })
})
