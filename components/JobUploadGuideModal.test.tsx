import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import JobUploadGuideModal from './JobUploadGuideModal'

describe('JobUploadGuideModal', () => {
  it('shows upload guidance and supports immediate close', () => {
    const onClose = vi.fn()
    render(<JobUploadGuideModal onClose={onClose} />)

    expect(screen.getByRole('dialog', { name: 'Job upload checklist' })).toBeInTheDocument()
    expect(screen.getByText('Keep the title clean')).toBeInTheDocument()
    expect(screen.getByText('Use the role name only; put places in Location.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close job upload guide' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('stays open until the recruiter deliberately closes it', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<JobUploadGuideModal onClose={onClose} />)

    act(() => vi.advanceTimersByTime(60_000))

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Job upload checklist' })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('closes from the primary action', () => {
    const onClose = vi.fn()
    render(<JobUploadGuideModal onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue to form' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
