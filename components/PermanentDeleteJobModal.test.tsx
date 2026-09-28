import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Job } from '@/types/types'
import PermanentDeleteJobModal from './PermanentDeleteJobModal'

const job = {
    _id: 'job-1',
    title: 'Test Sales Manager',
    totalApplicants: 3,
} as Job

describe('PermanentDeleteJobModal', () => {
    it('requires the exact vacancy title before enabling permanent deletion', () => {
        const onConfirm = vi.fn()
        render(
            <PermanentDeleteJobModal
                job={job}
                pending={false}
                onClose={vi.fn()}
                onConfirm={onConfirm}
            />,
        )

        const deleteButton = screen.getByRole('button', { name: 'Delete permanently' })
        const titleInput = screen.getByLabelText('Type the vacancy title to confirm')
        expect(deleteButton).toBeDisabled()

        fireEvent.change(titleInput, { target: { value: 'Test sales manager' } })
        expect(deleteButton).toBeDisabled()

        fireEvent.change(titleInput, { target: { value: 'Test Sales Manager' } })
        expect(deleteButton).toBeEnabled()
        fireEvent.click(deleteButton)

        expect(onConfirm).toHaveBeenCalledWith('Test Sales Manager')
    })

    it('shows server errors and supports cancellation', () => {
        const onClose = vi.fn()
        render(
            <PermanentDeleteJobModal
                job={job}
                pending={false}
                error="The confirmation title does not match this vacancy"
                onClose={onClose}
                onConfirm={vi.fn()}
            />,
        )

        expect(screen.getByRole('alert')).toHaveTextContent(
            'The confirmation title does not match this vacancy',
        )
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(onClose).toHaveBeenCalledOnce()
    })
})
