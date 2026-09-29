import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import JobActions from './JobActions'

const checkApplicationStatus = vi.hoisted(() => vi.fn())
const saveMutation = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useUsers', () => ({
  useUser: () => ({ data: { _id: 'candidate-1', role: 'user' }, isLoading: false }),
}))

vi.mock('@/hooks/useVacancies', () => ({
  useCheckApplicationStatus: (jobId: string, enabled: boolean) => {
    checkApplicationStatus(jobId, enabled)
    return { data: false, isLoading: false }
  },
  useSaveJob: () => ({ mutate: saveMutation, isPending: false }),
  useUnsaveJob: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('grouped vacancy actions', () => {
  beforeEach(() => {
    checkApplicationStatus.mockReset()
    saveMutation.mockReset()
  })

  it('requires an explicit location before applying or saving', () => {
    render(
      <JobActions
        jobId="job-abuja"
        jobTitle="Sales Manager"
        location="Abuja"
        locationOptions={[
          { jobId: 'job-abuja', location: 'Abuja' },
          { jobId: 'job-ilorin', location: 'Ilorin' },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Choose a location to apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Choose a location to save' })).toBeDisabled()
    expect(checkApplicationStatus).toHaveBeenLastCalledWith('job-abuja', false)

    fireEvent.change(screen.getByLabelText('Choose a location'), {
      target: { value: 'job-ilorin' },
    })

    expect(screen.getByRole('link', { name: 'Apply in Ilorin' })).toHaveAttribute(
      'href',
      '/vacancies/apply/job-ilorin',
    )
    expect(screen.getByRole('button', { name: 'Save job' })).toBeEnabled()
    expect(checkApplicationStatus).toHaveBeenLastCalledWith('job-ilorin', true)
  })

  it('keeps the existing direct flow for a standalone vacancy', () => {
    render(
      <JobActions
        jobId="job-one"
        jobTitle="Auditor"
        location="Lagos"
      />,
    )

    expect(screen.queryByLabelText('Choose a location')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Apply in Lagos' })).toHaveAttribute(
      'href',
      '/vacancies/apply/job-one',
    )
  })
})
