import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CvLinkGuidance from './CvLinkGuidance'

describe('CvLinkGuidance', () => {
    it('explains how to provide a publicly accessible CV link', () => {
        render(<CvLinkGuidance id="cv-help" />)

        expect(screen.getByText(/without a sign-in or access request/i)).toBeInTheDocument()
        expect(screen.getByText(/how to create a shareable CV link/i).closest('details')).toHaveAttribute('open')
        expect(screen.getByText('Recommended setup')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /open Drive/i })).toHaveAttribute('href', 'https://drive.google.com/')
        expect(screen.getByRole('button', { name: 'On a phone' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText(/Open the Drive app/i)).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'On a computer' }))
        expect(screen.getByRole('button', { name: 'On a computer' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText('New')).toBeInTheDocument()
        expect(screen.queryByText(/Open the Drive app/i)).not.toBeInTheDocument()
        expect(screen.getByText(/incognito window/i)).toBeInTheDocument()
        expect(screen.getByText(/Do not use the address from your browser bar/i)).toBeInTheDocument()
    })
})
