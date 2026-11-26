import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CandidateEmailAccessSettings from './CandidateEmailAccessSettings'
import { csrfFetch } from '@/api/csrf'

vi.mock('@/api/csrf', () => ({ csrfFetch: vi.fn() }))
let active: boolean
let conflict: boolean
const mount = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><CandidateEmailAccessSettings /></QueryClientProvider>)
beforeEach(() => {
  vi.clearAllMocks(); active = true; conflict = false
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 'success', data: [{ id: 'staff-one', name: 'Sending colleague', email: 'sender@example.com', role: 'admin', active, access: { enabled: false, templates: [], audienceScope: 'all-applicants', revision: 0, approvalRequired: true } }], pagination: { page: 1, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }), { status: 200 })))
  vi.mocked(csrfFetch).mockImplementation(async (_url, options) => conflict
    ? new Response(JSON.stringify({ message: 'Access changed elsewhere. Refresh before saving.' }), { status: 409 })
    : new Response(JSON.stringify({ status: 'success', data: { ...JSON.parse(String(options?.body)), revision: 1, approvalRequired: true } }), { status: 200 }))
})
describe('Individual candidate email permissions', () => {
  it('defaults to Any applicant, requires an assigned template and saves a revision', async () => {
    mount()
    const enabled = await screen.findByRole('checkbox', { name: 'Enable candidate email requests' })
    expect(enabled).not.toBeChecked()
    expect(screen.getByLabelText(/^Recipient scope/)).toHaveValue('all-applicants')
    fireEvent.click(enabled)
    expect(screen.getByRole('button', { name: 'Save access for Sending colleague' })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'CV needs attention' }))
    fireEvent.change(screen.getByLabelText(/^Recipient scope/), { target: { value: 'own-applicants' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save access for Sending colleague' }))
    await waitFor(() => expect(csrfFetch).toHaveBeenCalled())
    expect(JSON.parse(String(vi.mocked(csrfFetch).mock.calls[0][1]?.body))).toEqual({ enabled: true, templates: ['candidate-cv-attention'], audienceScope: 'own-applicants', revision: 0 })
  })
  it('cannot grant access to inactive staff', async () => {
    active = false; mount()
    expect(await screen.findByRole('checkbox', { name: 'Enable candidate email requests' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Add your CV' })).toBeDisabled()
  })
  it('shows a stale-revision error without losing the proposed grant', async () => {
    conflict = true; mount()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable candidate email requests' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Add your CV' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save access for Sending colleague' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Access changed elsewhere')
    expect(screen.getByRole('checkbox', { name: 'Add your CV' })).toBeChecked()
  })
})
