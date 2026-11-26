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
    if (path.startsWith('/options')) return { articles: [], vacancies: [{ _id: 'vacancy-one', title: 'Sales Manager', locations: ['Abuja'] }], images: [{ key: 'welcome', label: 'Jobs Lounge welcome', alt: 'Jobs Lounge welcome artwork', url: 'https://assets.example.com/welcome.jpg' }] } as never
    if (path.endsWith('/preview')) return review as never
    if (path.endsWith('/send')) return { ...draft, state: 'queued' } as never
    if (method === 'POST' || method === 'PATCH') { draft = { ...(body as object), _id: 'draft-id', revision: 0 }; return draft as never }
    return {} as never
  })
})
describe('Candidate email centre', () => {
  it('shows precise automatic-filter notices on restricted template cards only', () => {
    mount()
    for (const [title, requirement] of [
      ['Add your CV', 'no CV on profile'],
      ['Complete your profile', 'incomplete profiles'],
      ['Vacancy roundup', 'New vacancy alerts enabled'],
    ]) {
      const card = screen.getByRole('button', { name: new RegExp(`^${title}`) })
      expect(within(card).getByText(`Automatically filters: ${requirement}`)).toBeInTheDocument()
    }
    for (const title of ['Custom message', 'Activity check-in', 'CV needs attention']) {
      expect(within(screen.getByRole('button', { name: new RegExp(`^${title}`) })).queryByText(/Automatically filters/)).not.toBeInTheDocument()
    }
  })
  it('makes newsletter subscription requirements visible before recipient selection', () => {
    mount(true)
    const notice = screen.getByRole('note', { name: 'Email audience rules' })
    expect(notice).toHaveTextContent('Automatically filters: Career newsletter subscribers')
    expect(notice).toHaveTextContent('Included team members must also be eligible for staff newsletters.')
  })
  it('prefills an editable CV attention message with file replacement steps', () => {
    mount()
    const card = screen.getByRole('button', { name: /^CV needs attention/ })
    card.focus()
    expect(card).toHaveFocus()
    fireEvent.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Subject')).toHaveValue('Please check your CV on Jobs Lounge')
    const message = screen.getByLabelText(/^Message/) as HTMLTextAreaElement
    expect(message.value).toContain('There may be a problem with its link, access permissions or the file itself.')
    expect(message.value).toContain('1. Sign in and open My Profile.')
    expect(message.value).toContain('PDF or DOCX file of 3 MB or less')
    expect(message.value).toContain('If you already uploaded a file, use Replace.')
    expect(message.value).toContain('without creating a publicly shared link.')
    fireEvent.change(message, { target: { value: 'Please replace the unreadable file.' } })
    expect(message).toHaveValue('Please replace the unreadable file.')
  })
  it.each([
    { title: 'Add your CV', field: 'CV', value: 'missing', key: 'cv', explanation: 'Only candidates without a CV on their profile are shown.' },
    { title: 'Complete your profile', field: 'Profile', value: 'incomplete', key: 'profile', explanation: 'Only candidates with an incomplete profile are shown.' },
  ])('makes the $title requirement visible and keeps it after clearing filters', async ({ title, field, value, key, explanation }) => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }))
    compose()
    const notice = screen.getByRole('note', { name: 'Email audience rules' })
    expect(notice).toHaveTextContent(explanation)
    expect(notice).toHaveTextContent('Automatically filters:')
    expect(notice).toHaveTextContent('Custom message')
    expect(screen.getByLabelText(field)).toHaveValue(value)
    expect(screen.getByLabelText(field)).toBeDisabled()
    expect(screen.getByLabelText(field)).toHaveAccessibleDescription(expect.stringContaining(explanation))
    fireEvent.change(screen.getByLabelText('Search name or email'), { target: { value: 'ada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByLabelText('Search name or email')).toHaveValue('')
    expect(screen.getByLabelText(field)).toHaveValue(value)
    await waitFor(() => expect(vi.mocked(dispatchRequest).mock.calls.some(([path, , body]) =>
      path === '/recipients' && (body as { filters: Record<string, string> }).filters[key] === value,
    )).toBe(true))
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    await screen.findByTitle('Server-rendered email preview')
    const savedBody = vi.mocked(dispatchData).mock.calls.find(([, , body]) => (body as { selection?: unknown })?.selection)?.[2]
    expect(savedBody).toMatchObject({ filters: { [key]: value } })
  })
  it.each(['Add your CV', 'Complete your profile'])('removes the %s restriction when switching to CV needs attention', async (title) => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }))
    compose()
    fireEvent.click(screen.getByRole('button', { name: 'Change email type' }))
    fireEvent.click(screen.getByRole('button', { name: /^CV needs attention/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Select recipients →' }))
    const notice = screen.getByRole('note', { name: 'Email audience rules' })
    expect(notice).toHaveTextContent('No automatic CV or profile filter.')
    expect(notice).not.toHaveTextContent('Automatically filters:')
    expect(screen.getByLabelText('CV')).toBeEnabled()
    expect(screen.getByLabelText('Profile')).toBeEnabled()
    expect(screen.getByLabelText('CV')).toHaveValue('')
    expect(screen.getByLabelText('Profile')).toHaveValue('')
    fireEvent.change(screen.getByLabelText('CV'), { target: { value: 'available' } })
    fireEvent.change(screen.getByLabelText('Profile'), { target: { value: 'complete' } })
    await waitFor(() => expect(vi.mocked(dispatchRequest).mock.calls.some(([path, , body]) =>
      path === '/recipients' && (body as { template: string }).template === 'candidate-cv-attention'
        && (body as { filters: { cv?: string; profile?: string } }).filters.cv === 'available'
        && (body as { filters: { profile?: string } }).filters.profile === 'complete',
    )).toBe(true))
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByLabelText('CV')).toHaveValue('')
    expect(screen.getByLabelText('Profile')).toHaveValue('')
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Preview email →' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    await screen.findByTitle('Server-rendered email preview')
    expect(draft).toMatchObject({ template: 'candidate-cv-attention', filters: {}, selection: { ids: ['person-one'] } })
  })
  it('describes recorded CV presence without promising the document is accessible', async () => {
    mount(); compose()
    await screen.findByRole('checkbox', { name: 'Select Ada Candidate' })
    expect(within(screen.getByRole('table')).getByText('No CV on profile')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Next' }).find((button) => !button.hasAttribute('disabled'))!)
    await screen.findByRole('checkbox', { name: 'Select Second Candidate' })
    expect(within(screen.getByRole('table')).getByText('CV on profile')).toBeInTheDocument()
    expect(screen.queryByText('CV available')).not.toBeInTheDocument()
    expect(screen.queryByText('No CV link')).not.toBeInTheDocument()
  })
  it('allows unrestricted profile and CV filters after changing to a custom message', async () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: /^Add your CV/ }))
    compose()
    fireEvent.click(screen.getByRole('button', { name: 'Change email type' }))
    fireEvent.click(screen.getByRole('button', { name: /^Custom message/ }))
    compose()
    expect(screen.queryByRole('note', { name: 'Email audience rules' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('CV')).toBeEnabled()
    expect(screen.getByLabelText('Profile')).toBeEnabled()
    expect(screen.getByLabelText('CV')).toHaveValue('')
    fireEvent.change(screen.getByLabelText('CV'), { target: { value: 'available' } })
    await waitFor(() => expect(vi.mocked(dispatchRequest).mock.calls.some(([path, , body]) =>
      path === '/recipients' && (body as { template: string; filters: { cv?: string } }).template === 'candidate-message'
        && (body as { filters: { cv?: string } }).filters.cv === 'available',
    )).toBe(true))
  })
  it('requires a public opportunity before moving a vacancy roundup to recipients', async () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: /Vacancy roundup/ }))
    await screen.findByRole('checkbox', { name: /Sales Manager/ })
    expect(screen.getByRole('button', { name: 'Select recipients →' })).toBeDisabled()
    expect(screen.getByText('0 selected. At least one opportunity is required for this email.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: /Sales Manager/ }))
    expect(screen.getByRole('button', { name: 'Select recipients →' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Select recipients →' }))
    expect(screen.getByRole('note', { name: 'Email audience rules' })).toHaveTextContent('Only candidates who have enabled New vacancy alerts are shown.')
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    await screen.findByTitle('Server-rendered email preview')
    const savedBody = vi.mocked(dispatchData).mock.calls.find(([, , body]) => (body as { content?: unknown })?.content)?.[2] as { content: { vacancyIds: string[] } }
    expect(savedBody.content.vacancyIds).toEqual(['vacancy-one'])
  })
  it('returns an incomplete roundup draft to its opportunity picker', async () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: /Vacancy roundup/ }))
    fireEvent.click(screen.getByRole('button', { name: '2 Select recipients' }))
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Ada Candidate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview email →' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one public opportunity for the vacancy roundup.')
    expect(screen.getByRole('button', { name: 'Select recipients →' })).toBeDisabled()
    expect(vi.mocked(dispatchData).mock.calls.some(([path]) => path?.endsWith('/preview'))).toBe(false)
  })
  it.each(['Custom message', 'CV needs attention'])('saves an optional image and offers HTML and text previews for %s', async (title) => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }))
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
  it.each(['Custom message', 'CV needs attention'])('keeps named selections across searches for %s and reviews every selected recipient', async (title) => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }))
    compose()
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
  it.each(['Custom message', 'CV needs attention'])('keeps search as a filter for all matching %s recipients', async (title) => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }))
    compose()
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
    expect(screen.getByRole('note', { name: 'Email audience rules' })).toHaveTextContent('Only candidates subscribed to Career newsletter are shown.')
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
