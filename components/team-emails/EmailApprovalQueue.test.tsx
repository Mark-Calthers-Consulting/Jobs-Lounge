import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EmailApprovalQueue from './EmailApprovalQueue'
import { dispatchData, dispatchRequest } from '@/api/emailDispatches'

vi.mock('@/api/emailDispatches', () => ({ dispatchData: vi.fn(), dispatchRequest: vi.fn() }))
vi.mock('@/components/PlatformSettingsProvider', () => ({ usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }) }))
let state: string
let remaining: number
let stale: boolean
const mount = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><EmailApprovalQueue initialRequestId="request-one" /></QueryClientProvider>)
beforeEach(() => {
  vi.clearAllMocks(); state = 'awaiting-approval'; remaining = 2; stale = false
  vi.mocked(dispatchRequest).mockResolvedValue({ data: [{ _id: 'request-one', ownerName: 'Sending colleague', template: 'candidate-cv-attention', recipientCount: 3, state, submittedAt: '2026-11-26T09:00:00Z', expiresAt: '2026-12-03T09:00:00Z' }], pagination: { page: 1, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } } as never)
  vi.mocked(dispatchData).mockImplementation(async (path = '', method, body) => {
    if (path.endsWith('/approval-preview')) return { fingerprint: 'a'.repeat(64), recipientCount: remaining, originalCount: 3, removedCount: 3 - remaining, requesterName: 'Sending colleague', template: 'candidate-cv-attention', recipients: remaining ? [{ id: 'person-one', name: 'Amina', email: 'amina@example.com' }] : [], subject: 'Please check your CV', html: '<p>Locked preview</p>', text: 'Locked text preview' } as never
    if (path.endsWith('/approve')) { if (stale) { remaining = 1; throw new Error('Eligibility changed. Review again.') } state = 'queued'; return { state } as never }
    if (path.endsWith('/reject')) { state = 'rejected'; return { state, reason: (body as { reason: string }).reason } as never }
    if (method === undefined || method === 'GET') return { _id: 'request-one', ownerName: 'Sending colleague', state, recipientCount: 3, approval: { required: true, note: 'A CV link requests access.' } } as never
    return {} as never
  })
})
describe('Email approval queue', () => {
  it('shows the reduced recipient count and queues only after explicit confirmation', async () => {
    mount()
    await screen.findByTitle('Approval email preview')
    expect(screen.getByRole('status')).toHaveTextContent('1 of the original 3 recipients are no longer eligible')
    fireEvent.click(screen.getByText('Recipients (2)'))
    expect(within(screen.getByText('Recipients (2)').closest('details')!).getByText('Amina · amina@example.com')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Approve and queue' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('2 applicants will be queued')
    expect(vi.mocked(dispatchData).mock.calls.some(([path]) => path?.endsWith('/approve'))).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm approval and queue' }))
    await waitFor(() => expect(vi.mocked(dispatchData).mock.calls.find(([path]) => path?.endsWith('/approve'))?.[2]).toMatchObject({ fingerprint: 'a'.repeat(64), requestId: expect.any(String) }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
  it('blocks approval when nobody remains and requires a rejection reason', async () => {
    remaining = 0; mount()
    await screen.findByTitle('Approval email preview')
    expect(screen.getByRole('button', { name: 'Approve and queue' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reject request' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Reason for rejection'), { target: { value: 'Please select the right applicants.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reject request' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm rejection' }))
    await waitFor(() => expect(vi.mocked(dispatchData).mock.calls.find(([path]) => path?.endsWith('/reject'))?.[2]).toEqual({ reason: 'Please select the right applicants.' }))
  })
  it('refreshes a changed audience without silently retrying approval', async () => {
    stale = true; mount()
    await screen.findByTitle('Approval email preview')
    fireEvent.click(screen.getByRole('button', { name: 'Approve and queue' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm approval and queue' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Eligibility changed')
    await waitFor(() => expect(screen.getByText('1 eligible recipients')).toBeInTheDocument())
    expect(vi.mocked(dispatchData).mock.calls.filter(([path]) => path?.endsWith('/approve'))).toHaveLength(1)
  })
  it('offers readable HTML/text and mobile previews with keyboard focus', async () => {
    mount()
    const frame = await screen.findByTitle('Approval email preview')
    expect(frame).toHaveAttribute('sandbox', '')
    const mobile = screen.getByRole('button', { name: 'Mobile' }); mobile.focus(); expect(mobile).toHaveFocus()
    fireEvent.click(mobile)
    expect(frame.className).toContain('w-[375px]')
    fireEvent.click(screen.getByRole('button', { name: 'Text version' }))
    expect(screen.getByLabelText('Approval plain text preview')).toHaveTextContent('Locked text preview')
  })
  it('requests the frozen personalized preview for a chosen recipient', async () => {
    mount()
    await screen.findByTitle('Approval email preview')
    fireEvent.change(screen.getByLabelText('Preview for'), { target: { value: 'person-one' } })
    await waitFor(() => expect(vi.mocked(dispatchData).mock.calls.some(([path, , body]) => path === '/request-one/approval-preview' && (body as { recipientId?: string })?.recipientId === 'person-one')).toBe(true))
  })
})
