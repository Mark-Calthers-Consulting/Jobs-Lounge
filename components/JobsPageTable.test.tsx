import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import JobsPageTable from './JobsPageTable'

const state = vi.hoisted(() => ({
    query: '',
    role: 'super-admin' as string,
    replace: vi.fn(),
    job: {
        _id: 'job-1',
        title: 'Senior Sales Executive',
        description: 'Lead sales activity.',
        category: 'Business Development',
        location: 'Lagos',
        workMode: 'On-site',
        jobType: 'Full-time',
        level: 'Senior level',
        company: { name: 'Mark Calthers Consulting' },
        postedBy: { id: 'staff-1', name: 'Ada Recruiter' },
        lastEditedBy: { id: 'staff-2', name: 'Yinka Junaid', at: '2026-11-11T09:00:00.000Z' },
        responsibilities: [],
        benefits: [],
        requirements: [],
        skills: [],
        experience: 3,
        deadline: '2026-12-01T00:00:00.000Z',
        status: 'Open',
        views: 0,
        totalApplicants: 14,
        createdAt: '2026-11-01T09:00:00.000Z',
        updatedAt: '2026-11-11T09:00:00.000Z',
    },
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/admin-center/jobs',
    useRouter: () => ({ replace: state.replace, push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(state.query),
}))

vi.mock('@/hooks/useAdmin', () => ({
    useAdminJobUploaders: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
    useAdminVacancies: () => ({
        data: {
            data: [state.job],
            summary: { all: 1, my: 1, open: 1, draft: 0, closed: 0, deadlinePassed: 0, archived: 0 },
            pagination: { page: 2, limit: 20, total: 41, totalPages: 3, hasNextPage: true, hasPreviousPage: true },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    }),
    useDeleteAdminJob: () => ({ isPending: false, mutateAsync: vi.fn() }),
    usePermanentlyDeleteAdminJob: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useRestoreAdminJob: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useUpdateAdminJobStatus: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({ data: { _id: 'staff-1', name: 'Ada Recruiter', email: 'ada@example.com', role: state.role } }),
}))

vi.mock('./PlatformSettingsProvider', () => ({
    usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))

vi.mock('./Modal', () => ({ default: () => null }))
vi.mock('./PermanentDeleteJobModal', () => ({ default: () => null }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe('staff jobs directory layouts', () => {
    beforeEach(() => {
        state.query = ''
        state.role = 'super-admin'
        state.replace.mockReset()
    })

    it('defaults to List and exposes the selected layout accessibly', () => {
        render(<JobsPageTable />)

        expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'false')
        expect(screen.getByRole('table', { name: 'Admin job directory' })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

        expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false')
        expect(screen.getByRole('link', { name: 'Senior Sales Executive' }).closest('article')?.parentElement).toHaveClass('md:grid-cols-2', 'xl:grid-cols-3')
        expect(state.replace).not.toHaveBeenCalled()
    })

    it('shows vacancy details and role permitted application links in grid view', () => {
        render(<JobsPageTable />)
        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

        const detailsLink = screen.getByRole('link', { name: 'Senior Sales Executive' })
        const card = detailsLink.closest('article')
        expect(card).toHaveTextContent('Mark Calthers Consulting')
        expect(card).toHaveTextContent('Deadline')
        expect(card).toHaveTextContent('14')
        expect(card).toHaveTextContent('Ada Recruiter')
        expect(card).toHaveTextContent('Last edited by')
        expect(detailsLink).toHaveAttribute('href', '/admin-center/jobs/job-1')
        expect(card?.querySelector('a[href="/admin-center/applications?jobId=job-1"]')).toBeInTheDocument()
    })

    it('does not link to application records for staff without application review access', () => {
        state.role = 'admin'
        render(<JobsPageTable />)
        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

        const card = screen.getByRole('link', { name: 'Senior Sales Executive' }).closest('article')
        expect(card).toHaveTextContent('14')
        expect(card?.querySelector('a[href="/admin-center/applications?jobId=job-1"]')).not.toBeInTheDocument()
    })

    it('preserves the selected layout across job views and keeps filters when paginating', () => {
        state.query = 'page=2&view=open&search=sales&uploaderId=507f1f77bcf86cd799439011'
        const view = render(<JobsPageTable />)
        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))

        expect(state.replace).toHaveBeenCalledWith('/admin-center/jobs?page=3&view=open&search=sales&uploaderId=507f1f77bcf86cd799439011', { scroll: false })
        fireEvent.click(screen.getByRole('button', { name: /Drafts/ }))

        expect(state.replace).toHaveBeenLastCalledWith('/admin-center/jobs?view=draft&search=sales&uploaderId=507f1f77bcf86cd799439011', { scroll: false })
        state.query = 'view=draft&search=sales&uploaderId=507f1f77bcf86cd799439011'
        view.rerender(<JobsPageTable />)
        expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true')
    })
})
