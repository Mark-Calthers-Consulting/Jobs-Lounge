import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ContactForm from './ContactForm'

const mocks = vi.hoisted(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
}))

vi.mock('@/hooks/useContact', () => ({
    useSubmitContactMessage: () => ({
        isPending: mocks.isPending,
        mutateAsync: mocks.mutateAsync,
    }),
}))

vi.mock('sonner', () => ({
    toast: {
        error: mocks.toastError,
        success: mocks.toastSuccess,
    },
}))

const completeRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/Full name/), {
        target: { value: 'Ada Lovelace' },
    })
    fireEvent.change(screen.getByLabelText(/Email address/), {
        target: { value: 'ada@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/Subject/), {
        target: { value: 'Account support' },
    })
    fireEvent.change(screen.getByLabelText(/Message/), {
        target: { value: 'Please help me access my profile.' },
    })
}

describe('ContactForm', () => {
    beforeEach(() => {
        mocks.isPending = false
        mocks.mutateAsync.mockReset()
        mocks.mutateAsync.mockResolvedValue({ accepted: true })
        mocks.toastError.mockReset()
        mocks.toastSuccess.mockReset()
    })

    it('submits the optional telephone with the existing contact fields', async () => {
        render(<ContactForm />)
        completeRequiredFields()
        fireEvent.change(screen.getByLabelText(/Telephone/), {
            target: { value: '+234 902 888 8885' },
        })

        fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)

        await waitFor(() => {
            expect(mocks.mutateAsync).toHaveBeenCalledWith({
                name: 'Ada Lovelace',
                email: 'ada@example.com',
                telephone: '+234 902 888 8885',
                subject: 'Account support',
                message: 'Please help me access my profile.',
            })
        })
        expect(await screen.findByRole('status')).toHaveTextContent('received your message')
        expect(screen.getByLabelText(/Full name/)).toHaveValue('')
    })

    it('shows a field error and does not submit an invalid telephone', () => {
        render(<ContactForm />)
        completeRequiredFields()
        const telephone = screen.getByLabelText(/Telephone/)
        fireEvent.change(telephone, { target: { value: 'call me' } })

        fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)

        expect(telephone).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByText('Enter a valid telephone number with 7 to 15 digits.')).toBeInTheDocument()
        expect(mocks.mutateAsync).not.toHaveBeenCalled()
    })

    it('shows an inline error when delivery cannot be queued', async () => {
        mocks.mutateAsync.mockRejectedValue(new Error('Contact service is temporarily unavailable.'))
        render(<ContactForm />)
        completeRequiredFields()

        fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)

        expect(await screen.findByRole('alert')).toHaveTextContent('Contact service is temporarily unavailable.')
        expect(mocks.toastError).toHaveBeenCalledWith('Contact service is temporarily unavailable.')
    })

    it('announces and disables the pending submit action', () => {
        mocks.isPending = true
        render(<ContactForm />)

        expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
        expect(screen.getByRole('form')).toHaveAttribute('aria-busy', 'true')
    })
})
