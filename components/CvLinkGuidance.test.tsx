import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CvLinkGuidance from './CvLinkGuidance'

describe('CvLinkGuidance', () => {
    it('explains how to provide a publicly accessible CV link', () => {
        render(<CvLinkGuidance id="cv-help" />)

        expect(screen.getByText(/must not be private/i)).toBeInTheDocument()
        expect(screen.getByText(/how to get a shareable CV link/i)).toBeInTheDocument()
        expect(screen.getByText(/Google Drive or another cloud-storage service/i)).toBeInTheDocument()
        expect(screen.getByText(/anyone with the link/i)).toBeInTheDocument()
        expect(screen.getByText(/private browser window/i)).toBeInTheDocument()
    })
})
