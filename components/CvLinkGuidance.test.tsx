import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CvLinkGuidance from './CvLinkGuidance'

describe('CvLinkGuidance', () => {
    it('explains how to provide a publicly accessible CV link', () => {
        render(<CvLinkGuidance id="cv-help" />)

        expect(screen.getByText(/without signing in or requesting access/i)).toBeInTheDocument()
        expect(screen.getByText(/upload your CV and get the link/i).closest('details')).toHaveAttribute('open')
        expect(screen.getByRole('link', { name: /open Google Drive/i })).toHaveAttribute('href', 'https://drive.google.com/')
        expect(screen.getByRole('heading', { name: 'On a phone' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'On a computer' })).toBeInTheDocument()
        expect(screen.getAllByText(/anyone with the link/i)).toHaveLength(2)
        expect(screen.getByText(/do not copy the address from your browser bar/i)).toBeInTheDocument()
        expect(screen.getByText(/private or incognito window/i)).toBeInTheDocument()
    })
})
