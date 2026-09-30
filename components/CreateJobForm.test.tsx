import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CUSTOM_JOB_LOCATION_OPTION } from '@/constants/nigeria'
import CreateJobForm from './CreateJobForm'

const { batchMutation, createMutation, updateMutation } = vi.hoisted(() => ({
    batchMutation: { isPending: false, mutateAsync: vi.fn() },
    createMutation: { isPending: false, mutateAsync: vi.fn() },
    updateMutation: { isPending: false, mutateAsync: vi.fn() },
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/useApplications', () => ({
    useCreatejob: () => createMutation,
    useCreateJobBatch: () => batchMutation,
}))

vi.mock('@/hooks/useAdmin', () => ({
    useUpdateAdminJob: () => updateMutation,
}))

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({ data: { role: 'super-admin' } }),
}))

const openForm = () => {
    render(<CreateJobForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue to form' }))
}

describe('multi-location vacancy form', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('adds and removes compact location rows while keeping focus predictable', async () => {
        openForm()

        const firstLocation = screen.getByLabelText('Vacancy location')
        expect(screen.getByText('Choose where this vacancy is based.')).toBeInTheDocument()
        expect(screen.queryByText('Additional locations')).not.toBeInTheDocument()
        expect(screen.queryByText(/Each added location creates a separate vacancy/)).not.toBeInTheDocument()
        fireEvent.change(firstLocation, { target: { value: 'Abuja' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add another location' }))

        const secondLocation = screen.getByLabelText('Additional location 1')
        expect(screen.getByText('Additional locations')).toBeInTheDocument()
        expect(screen.getByText(/Each added location creates a separate vacancy/)).toBeInTheDocument()
        await waitFor(() => expect(secondLocation).toHaveFocus())
        fireEvent.change(secondLocation, { target: { value: 'Ilorin' } })

        expect(screen.getByRole('button', { name: 'Save 2 drafts' })).toBeInTheDocument()
        expect(screen.getAllByText('Untitled vacancy')).toHaveLength(2)

        fireEvent.click(screen.getByRole('button', { name: 'Remove additional location 1' }))
        await waitFor(() => expect(firstLocation).toHaveFocus())
        expect(screen.queryByLabelText('Additional location 1')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Save draft' })).toBeInTheDocument()
    })

    it('shows duplicate-location guidance and enforces the ten-location cap', () => {
        openForm()

        fireEvent.change(screen.getByLabelText('Vacancy location'), { target: { value: 'Lagos' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add another location' }))
        fireEvent.change(screen.getByLabelText('Additional location 1'), {
            target: { value: CUSTOM_JOB_LOCATION_OPTION },
        })
        const customLocation = screen.getByLabelText('Enter location')
        fireEvent.change(customLocation, { target: { value: 'Lagos, Abuja' } })

        expect(screen.getByRole('status')).toHaveTextContent(
            'This field is for one location. If the comma separates different locations, add each location separately below.',
        )

        fireEvent.change(customLocation, { target: { value: ' lagos ' } })

        expect(screen.getByText('One location only. If this vacancy is available elsewhere, use Add another location below.')).toBeInTheDocument()
        expect(screen.queryByText(/If the comma separates different locations/)).not.toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Each vacancy location must be different.')

        fireEvent.change(screen.getByLabelText('Additional location 1'), { target: { value: 'Ilorin' } })
        for (let index = 0; index < 8; index += 1) {
            fireEvent.click(screen.getByRole('button', { name: 'Add another location' }))
        }

        expect(screen.getByLabelText('Additional location 9')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add another location' })).toBeDisabled()
        expect(screen.getByText('Maximum of 10 locations reached.')).toBeInTheDocument()
    })

    it('loads JSON into one location and clears added location rows', () => {
        openForm()
        fireEvent.click(screen.getByRole('button', { name: 'Add another location' }))
        expect(screen.getByLabelText('Additional location 1')).toBeInTheDocument()

        fireEvent.change(screen.getByLabelText('Job JSON'), {
            target: {
                value: JSON.stringify({
                    title: 'Sales Manager',
                    description: 'Lead regional sales execution and coach a growing commercial team.',
                    company: { name: 'Example Limited' },
                    category: 'Sales, Marketing & Retail',
                    location: 'Abuja',
                    workMode: 'On-site',
                    jobType: 'Full-time',
                    level: 'Manager',
                    salary: { currency: 'NGN' },
                    responsibilities: ['Lead the sales team'],
                    requirements: ['Relevant sales experience'],
                    benefits: ['Health insurance'],
                    experience: 4,
                    skills: ['Sales leadership'],
                    status: 'Draft',
                }),
            },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Load into form' }))

        expect(screen.queryByLabelText('Additional location 1')).not.toBeInTheDocument()
        expect(screen.getByLabelText('Vacancy location')).toHaveValue('Abuja')
        expect(screen.getByRole('status')).toHaveTextContent('Loaded')
    })
})
