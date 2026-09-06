import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Auth from './page'

vi.mock('@/components/AuthForm', () => ({
  default: ({ initialMode }: { initialMode: string }) => <p>Initial mode: {initialMode}</p>,
}))
vi.mock('@/components/GuestOnlyRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('next/image', () => ({
  default: () => null,
}))

describe('candidate auth route mode', () => {
  it('opens registration for an explicit register mode', async () => {
    render(await Auth({ searchParams: Promise.resolve({ mode: 'register' }) }))
    expect(screen.getByText('Initial mode: register')).toBeInTheDocument()
  })

  it('falls back to sign in for missing or unsupported modes', async () => {
    const { rerender } = render(await Auth({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('Initial mode: login')).toBeInTheDocument()

    rerender(await Auth({ searchParams: Promise.resolve({ mode: 'unsupported' }) }))
    expect(screen.getByText('Initial mode: login')).toBeInTheDocument()
  })
})
