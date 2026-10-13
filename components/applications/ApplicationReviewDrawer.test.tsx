import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ApplicationReviewDrawer from './ApplicationReviewDrawer'

vi.mock('./ApplicationDetailPanel', () => ({
  default: ({ applicationId }: { applicationId: string }) => (
    <button type="button">Candidate {applicationId}</button>
  ),
}))

afterEach(() => cleanup())

describe('ApplicationReviewDrawer', () => {
  it('opens as a focused modal drawer and closes with Escape', () => {
    const onClose = vi.fn()
    render(<ApplicationReviewDrawer applicationId="application-1" onClose={onClose} />)

    expect(screen.getByRole('dialog', { name: 'Candidate application review' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close application review' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps keyboard focus within the drawer', () => {
    render(<ApplicationReviewDrawer applicationId="application-2" onClose={() => undefined} />)
    const closeButton = screen.getByRole('button', { name: 'Close application review' })
    const candidateButton = screen.getByRole('button', { name: 'Candidate application-2' })

    candidateButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
  })
})
