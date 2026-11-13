import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CandidatesGrid from './CandidatesGrid'

const state = vi.hoisted(() => ({
    query: '',
    role: 'super-admin' as string,
    replace: vi.fn(),
    candidate: {
        _id: 'candidate-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        telephone: '+2348012345678',
        highestEducation: "Bachelor's degree",
        postNyscExperience: 4,
        profileCompleted: true,
        profileCompletion: { complete: true, percentage: 100, missingSectionCount: 0 },
        duplicateSignal: { possibleDuplicate: false, matchFields: [] },
        applicationCount: 2,
        latestApplicationAt: '2026-11-10T09:00:00.000Z',
        lastActiveAt: '2026-11-11T09:00:00.000Z',
        lastLoginAt: '2026-11-11T08:00:00.000Z',
        createdAt: '2026-10-01T09:00:00.000Z',
        updatedAt: '2026-11-11T09:00:00.000Z',
    },
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/admin-center/candidates',
    useRouter: () => ({ replace: state.replace, push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(state.query),
}))

vi.mock('@/hooks/useAdmin', () => ({
    useCandidateFilterOptions: () => ({ data: { educationLevels: [], jobs: [] }, isLoading: false, isFetching: false, isError: false }),
    useGetJobCandidates: () => ({
        data: {
            data: [state.candidate],
            pagination: { page: 2, limit: 20, total: 41, totalPages: 3, hasNextPage: true, hasPreviousPage: true },
        },
        isLoading: false,
        isError: false,
    }),
}))

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({ data: { _id: 'staff-1', role: state.role } }),
}))

vi.mock('./PlatformSettingsProvider', () => ({
    usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))

describe('candidate directory layouts', () => {
    beforeEach(() => {
        state.query = ''
        state.role = 'super-admin'
        state.replace.mockReset()
    })

    it('defaults to List and exposes the selected layout accessibly', () => {
        render(<CandidatesGrid />)

        expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'false')
        expect(screen.getByRole('table', { name: /Candidate directory/ })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

        expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false')
        expect(screen.getByRole('heading', { name: 'Ada Lovelace' }).closest('article')?.parentElement).toHaveClass('md:grid-cols-2', 'xl:grid-cols-3')
        expect(state.replace).not.toHaveBeenCalled()
    })

    it('shows application data for candidates and Super-admin activity data', () => {
        render(<CandidatesGrid />)
        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

        const card = screen.getByRole('heading', { name: 'Ada Lovelace' }).closest('article')
        expect(card).toHaveTextContent('Applications')
        expect(card).toHaveTextContent('2')
        expect(card).toHaveTextContent('Account activity')
        expect(within(card as HTMLElement).getByRole('link', { name: 'View candidate' })).toHaveAttribute('href', '/admin-center/candidates/candidate-1')
    })

    it('shows registered-user cards without application data, while retaining Super-admin activity', () => {
        state.query = 'view=registered'
        render(<CandidatesGrid />)
        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

        const card = screen.getByRole('heading', { name: 'Ada Lovelace' }).closest('article')
        expect(card).toHaveTextContent('Education')
        expect(card).toHaveTextContent('Joined')
        expect(card).toHaveTextContent('Account activity')
        expect(card).not.toHaveTextContent('Applications')
        expect(within(card as HTMLElement).getByRole('link', { name: 'View user' })).toHaveAttribute('href', '/admin-center/candidates/candidate-1')
    })

    it('preserves the selected layout when switching between directory tabs', () => {
        const view = render(<CandidatesGrid />)
        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))
        fireEvent.click(screen.getByRole('button', { name: 'Registered users' }))

        state.query = 'view=registered'
        view.rerender(<CandidatesGrid />)

        expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('hides account activity from staff roles without Super-admin access', () => {
        state.role = 'recruiter'
        render(<CandidatesGrid />)
        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))

        const card = screen.getByRole('heading', { name: 'Ada Lovelace' }).closest('article')
        expect(card).toHaveTextContent('Applications')
        expect(card).not.toHaveTextContent('Account activity')
        expect(card).not.toHaveTextContent('Last login')
    })

    it('keeps filters and pagination in the URL when list controls are used', () => {
        state.query = 'page=2&profileCompleted=false&education=Diploma'
        render(<CandidatesGrid />)

        fireEvent.click(screen.getByRole('button', { name: 'Grid' }))
        expect(state.replace).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))

        expect(state.replace).toHaveBeenCalledWith('/admin-center/candidates?page=3&profileCompleted=false&education=Diploma', { scroll: false })
    })
})
