import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Contact from './page'

vi.mock('@/components/PlatformSettingsProvider', () => ({
    usePlatformSettings: () => ({
        supportEmail: 'help@example.com',
        timeZone: 'Africa/Lagos',
    }),
}))

vi.mock('@/components/ContactForm', () => ({
    default: () => <div data-testid="contact-form">Contact form</div>,
}))

describe('Contact page', () => {
    it('shows configured support details and both office addresses', () => {
        render(<Contact />)

        expect(screen.getByRole('heading', { name: "We're here to help." })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'help@example.com' })).toHaveAttribute(
            'href',
            'mailto:help@example.com',
        )
        expect(screen.getByText(/14, Lanre Awolokun Street/)).toBeInTheDocument()
        expect(screen.getByText(/Suite 12, 2nd Floor, Ogun House/)).toBeInTheDocument()
    })

    it('keeps the Lagos map accessible and lazily loaded', () => {
        render(<Contact />)

        const map = screen.getByTitle('Map showing the Jobs Lounge Lagos office')
        expect(map).toHaveAttribute('loading', 'lazy')
        expect(map).toHaveAttribute('src', expect.stringContaining('openstreetmap.org'))
    })
})
