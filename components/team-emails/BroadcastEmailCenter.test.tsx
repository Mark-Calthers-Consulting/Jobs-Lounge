import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BroadcastEmailCenter, { selectedCount } from './BroadcastEmailCenter'
import { dispatchData, dispatchRequest } from '@/api/emailDispatches'

vi.mock('@/api/emailDispatches', () => ({ dispatchData: vi.fn(), dispatchRequest: vi.fn() }))
vi.mock('@/components/PlatformSettingsProvider', () => ({ usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
const pagination = { page: 1, total: 2, totalPages: 2, hasNextPage: true, hasPreviousPage: false }
const people = [{ id: 'person-one', name: 'Ada Candidate', email: 'ada@example.com', audience: 'candidate', profileComplete: false, hasCv: false }, { id: 'person-two', name: 'Second Candidate', email: 'second@example.com', audience: 'candidate', profileComplete: true, hasCv: true }]
let draft: Record<string, unknown>
const review = { fingerprint: 'a'.repeat(64), recipientCount: 1, candidateCount: 1, teamCount: 0, recipients: [people[0]], subject: 'A helpful update', html: '<p>Hello Ada</p>', text: 'Hello Ada' }
const mount = (newsletter = false, superAdmin = true) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><BroadcastEmailCenter channel={newsletter ? 'newsletter' : 'candidate'} superAdmin={superAdmin} /></QueryClientProvider>)
const compose = () => {
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'A helpful update' } })
  fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'A useful message' } })
  fireEvent.click(screen.getByRole('button', { name: 'Select recipients →' }))
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(dispatchRequest).mockImplementation(async (path = '', _method, body) => {
    if (path.startsWith('/recipients')) {
      const page = (body as { page: number }).page
      const search = (body as { filters?: { search?: string } }).filters?.search?.toLowerCase()
      if (search) {
        return { data: search.includes('second') ? [people[1]] : [people[0]], pagination: { page: 1, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }, vacancies: [] } as never
      }
      return { data: page === 2 ? [people[1]] : [people[0]], pagination: { ...pagination, page, hasNextPage: page === 1, hasPreviousPage: page === 2 }, vacancies: [] } as never
    }
    return { data: [], pagination: { ...pagination, total: 0, totalPages: 1, hasNextPage: false } } as never
  })
  vi.mocked(dispatchData).mockImplementation(async (path = '', method, body) => {
    if (path.startsWith('/options')) return { articles: [], vacancies: [], images: [{ key: 'welcome', label: 'Jobs Lounge welcome', alt: 'Jobs Lounge welcome artwork', url: 'https://assets.example.com/welcome.jpg' }] } as never
    if (path.endsWith('/preview')) return review as never
    if (path.endsWith('/send')) return { ...draft, state: 'queued' } as never
    if (method === 'POST' || method === 'PATCH') { draft = { ...(body as object), _id: 'draft-id', revision: 0 }; return draft as never }
    return {} as never
  })
})
describe('Candidate email centre', () => {
  it('saves an optional image and offers the rendered HTML and plain text previews', async () => {
    mount()
    expect(screen.getByRole('radio', { name: 'No image' })).toBeChecked()
    fireEvent.click(await screen.findByRole('radio', { name: 'Jobs Lounge welcome' }))
    compose()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    expect(await screen.findByTitle('Server-rendered email preview')).toHaveAttribute('srcdoc', review.html)
    const savedBody = vi.mocked(dispatchData).mock.calls.find(([, , body]) => (body as { content?: unknown })?.content)?.[2] as { content: { imageKey: string } }
    expect(savedBody.content.imageKey).toBe('welcome')
    fireEvent.click(screen.getByRole('button', { name: 'Text version' }))
    expect(screen.getByLabelText('Plain text email preview')).toHaveTextContent('Hello Ada')
    expect(screen.queryByTitle('Server-rendered email preview')).not.toBeInTheDocument()
  })
  it('provides accessible template choice and clears selections when filters change', async () => {
    mount(); compose()
    await screen.findByRole('checkbox', { name: 'Select Ada Candidate' })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Candidate' }))
    expect(screen.getByRole('checkbox', { name: 'Select Ada Candidate' })).toBeChecked()
    fireEvent.change(screen.getByLabelText('CV'), { target: { value: 'missing' } })
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select Ada Candidate' })).not.toBeChecked())
  })
  it('offers unverified accounts only and passes that audience filter to review', async () => {
    mount(); compose()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.change(screen.getByLabelText('Email verification'), { target: { value: 'unverified' } })
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select Ada Candidate' })).not.toBeChecked())
    expect(screen.getByRole('option', { name: 'Unverified accounts only' })).toBeInTheDocument()
    await waitFor(() => expect(vi.mocked(dispatchRequest).mock.calls.some(([path, , body]) =>
      path === '/recipients' && (body as { filters?: { verified?: string } })?.filters?.verified === 'unverified',
    )).toBe(true))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    await screen.findByTitle('Server-rendered email preview')
    const call = vi.mocked(dispatchData).mock.calls.find(([, , body]) => (body as { filters?: { verified?: string } })?.filters?.verified === 'unverified')
    expect(call?.[2]).toMatchObject({ filters: { verified: 'unverified' } })
  })
  it('preserves explicit selections across pages', async () => {
    mount(); compose()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Next' }).find((button) => !button.hasAttribute('disabled'))!)
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Second Candidate' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Previous' }).find((button) => !button.hasAttribute('disabled'))!)
    expect(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' })).toBeChecked()
  })
  it('keeps named selections across searches and reviews every selected recipient', async () => {
    mount(); compose()
    fireEvent.change(screen.getByLabelText('Search name or email'), { target: { value: 'ada' } })
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    const selected = screen.getByRole('region', { name: 'Selected recipients' })
    expect(within(selected).getByText('Ada Candidate')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search name or email'), { target: { value: 'second' } })
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Second Candidate' }))
    expect(within(selected).getByText('Ada Candidate')).toBeInTheDocument()
    expect(within(selected).getByText('Second Candidate')).toBeInTheDocument()
    expect(within(selected).getByText('Selected recipients (2)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    await screen.findByTitle('Server-rendered email preview')
    const call = vi.mocked(dispatchData).mock.calls.find(([, , body]) => (body as { selection?: unknown })?.selection)
    expect(call?.[2]).toMatchObject({ selection: { mode: 'explicit', ids: ['person-one', 'person-two'] }, filters: {} })
  })
  it('lets staff remove a recipient outside the current search', async () => {
    mount(); compose()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.change(screen.getByLabelText('Search name or email'), { target: { value: 'second' } })
    const selected = screen.getByRole('region', { name: 'Selected recipients' })
    fireEvent.click(within(selected).getByRole('button', { name: 'Remove Ada Candidate from selected recipients' }))
    expect(screen.queryByRole('region', { name: 'Selected recipients' })).not.toBeInTheDocument()
  })
  it('keeps search as a filter when selecting all matching recipients', async () => {
    mount(); compose()
    fireEvent.change(screen.getByLabelText('Search name or email'), { target: { value: 'ada' } })
    await screen.findByRole('checkbox', { name: 'Select Ada Candidate' })
    fireEvent.click(screen.getByRole('button', { name: 'Select all matching' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    await screen.findByTitle('Server-rendered email preview')
    const call = vi.mocked(dispatchData).mock.calls.find(([, , body]) => (body as { selection?: unknown })?.selection)
    expect(call?.[2]).toMatchObject({ selection: { mode: 'all' }, filters: { search: 'ada' } })
  })
  it('supports all matching recipients with explicit exclusions', async () => {
    mount(); compose(); await screen.findByRole('checkbox', { name: 'Select Ada Candidate' })
    fireEvent.click(screen.getByRole('button', { name: 'Select all matching' }))
    expect(screen.getByRole('checkbox', { name: 'Select Ada Candidate' })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    await screen.findByTitle('Server-rendered email preview')
    const call = vi.mocked(dispatchData).mock.calls.find(([, , body]) => (body as { selection?: unknown })?.selection)
    expect((call?.[2] as { selection: unknown }).selection).toEqual({ mode: 'all', ids: [], excludeIds: ['person-one'] })
  })
  it('requires explicit confirmation and reports queue acceptance', async () => {
    mount(); compose(); fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    expect(await screen.findByTitle('Server-rendered email preview')).toHaveAttribute('sandbox', '')
    fireEvent.click(screen.getByRole('button', { name: 'Queue email' }))
    expect(vi.mocked(dispatchData).mock.calls.some(([path]) => path?.endsWith('/send'))).toBe(false)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm and queue' }))
    await waitFor(() => expect(vi.mocked(dispatchData).mock.calls.some(([path]) => path?.endsWith('/send'))).toBe(true))
    await waitFor(() => expect(screen.getByLabelText('Subject')).toHaveValue(''))
  })
  it('retains composition after failed draft saves', async () => {
    mount()
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Keep this subject' } })
    vi.mocked(dispatchData).mockRejectedValueOnce(new Error('Connection interrupted'))
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Connection interrupted')
    expect(screen.getByLabelText('Subject')).toHaveValue('Keep this subject')
  })
  it('does not expose account group or exact activity timestamps to recruiters', async () => {
    mount(false, false); compose(); await screen.findByRole('checkbox', { name: 'Select Ada Candidate' })
    expect(screen.queryByLabelText('Account group')).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Last active' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Last active')).toBeInTheDocument()
  })
  it('team newsletter inclusion is unchecked and Super-admin-only', async () => {
    const view = mount(true)
    fireEvent.click(screen.getByRole('button', { name: 'Select recipients →' }))
    expect(screen.getByRole('checkbox', { name: /Include active team members/ })).not.toBeChecked()
    view.unmount(); mount(true, false)
    fireEvent.click(screen.getByRole('button', { name: 'Select recipients →' }))
    expect(screen.queryByRole('checkbox', { name: /Include active team members/ })).not.toBeInTheDocument()
  })
  it('counts all matching selections after exclusions', () => {
    expect(selectedCount({ mode: 'all', ids: [], excludeIds: ['one', 'two'] }, 1001)).toBe(999)
    expect(selectedCount({ mode: 'explicit', ids: ['one'], excludeIds: [] }, 1001)).toBe(1)
  })
})
