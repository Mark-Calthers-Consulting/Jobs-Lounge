/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Home, { metadata } from './page'

vi.mock('@/components/HomepageDiscovery', () => ({
  default: () => <div data-testid="homepage-discovery">Live discovery</div>,
}))
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

describe('homepage', () => {
  it('provides one clear heading and direct candidate actions', () => {
    render(<Home />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Find the opportunity that moves you forward.' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Browse (opportunities|vacancies)/ })).not.toHaveLength(0)
    for (const link of screen.getAllByRole('link', { name: /Create your (profile|account)/ })) {
      expect(link).toHaveAttribute('href', '/auth?mode=register')
    }
  })

  it('retains the mission and vision, accurate FAQs, and no email capture', () => {
    render(<Home />)

    expect(screen.getByText(/our mission is to revolutionize the job search experience/)).toBeInTheDocument()
    expect(screen.getByText(/To be the leading online job portal/)).toBeInTheDocument()
    expect(screen.getByText('What do I need before I apply?')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /email/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/YouTube/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/mobile app/i)).not.toBeInTheDocument()
  })

  it('defines production homepage metadata', () => {
    expect(metadata.alternates).toEqual({ canonical: 'https://jobslounge.markcalthers.com' })
    expect(metadata.title).toBe('Jobs Lounge | Find your next opportunity')
    expect(metadata.openGraph).toMatchObject({ url: 'https://jobslounge.markcalthers.com' })
  })
})
