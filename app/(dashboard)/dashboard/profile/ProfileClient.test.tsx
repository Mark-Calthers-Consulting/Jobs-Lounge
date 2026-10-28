import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileClient from './ProfileClient'

let candidate: Record<string, unknown>
const mutateAsync = vi.fn()

vi.mock('@/hooks/useUsers', () => ({
  useUser: () => ({ data: candidate, isLoading: false, isError: false }),
  useEditUserDetails: () => ({ mutateAsync, isPending: false }),
}))
vi.mock('@/components/CvManager', () => ({ default: () => <div>CV controls</div> }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const makeCandidate = () => ({
  email: 'ada@example.test',
  firstName: 'Ada',
  middleName: '',
  otherName: 'Grace',
  lastName: 'Lovelace',
  dob: '1990-01-01',
  gender: 'prefer-not-to-say',
  telephone: '+2348000000000',
  whatsapp: '',
  highestEducation: "Bachelor's degree",
  nyscStatus: 'completed',
  yearCompletedNysc: 2020,
  postNyscExperience: 2,
  cvLink: '',
  coverLetterLink: '',
  maritalStatus: '',
  residentialAddress: '',
  profileCompletion: {
    complete: false, completedSteps: 2, totalSteps: 3, percentage: 67,
    steps: [
      { id: 'identity', label: 'Identity and contact', complete: true },
      { id: 'professional', label: 'Professional profile', complete: true },
      { id: 'cv', label: 'CV', complete: false },
    ],
  },
})

describe('candidate profile layout', () => {
  beforeEach(() => {
    candidate = makeCandidate()
    mutateAsync.mockReset().mockResolvedValue(candidate)
  })

  it('shows three required progress sections and keeps additional details separate', () => {
    render(<ProfileClient />)
    expect(screen.getByText('2 of 3 sections complete')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Profile completion' })).toHaveAttribute('aria-valuenow', '67')
    expect(screen.getByRole('heading', { name: '1. Identity and contact' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2. Professional profile' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '3. CV' })).toBeInTheDocument()
    expect(screen.getByRole('separator', { name: 'Or add a CV link instead' })).toBeInTheDocument()
    expect(screen.getByText(/Add a CV link/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Additional details/ })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Save changes' })).toHaveLength(4)
  })

  it('retains unsaved identity edits when profile data refreshes', async () => {
    const { rerender } = render(<ProfileClient />)
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Adanna' } })
    candidate = { ...candidate, postNyscExperience: 3 }
    rerender(<ProfileClient />)
    await waitFor(() => expect(screen.getByLabelText('First name')).toHaveValue('Adanna'))
    expect(screen.getByLabelText('Post-NYSC experience (years)')).toHaveValue(3)
  })
})
