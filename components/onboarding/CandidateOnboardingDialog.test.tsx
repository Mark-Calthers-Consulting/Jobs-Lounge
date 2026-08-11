import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CandidateOnboardingDialog from './CandidateOnboardingDialog'
import type { CandidateOnboarding } from '@/types/types'

const mocks = vi.hoisted(() => ({
    saveInterests: vi.fn(),
    saveAcquisition: vi.fn(),
    snooze: vi.fn(),
}))

vi.mock('@/hooks/useCandidateOnboarding', () => ({
    useSaveOnboardingInterests: () => ({ isPending: false, mutateAsync: mocks.saveInterests }),
    useSaveOnboardingAcquisition: () => ({ isPending: false, mutateAsync: mocks.saveAcquisition }),
    useSnoozeCandidateOnboarding: () => ({ isPending: false, mutateAsync: mocks.snooze }),
}))

const onboarding: CandidateOnboarding = {
    questionnaire: {
        questionnaireStatus: 'not-started',
        currentStep: 1,
        questionnaireVersion: 1,
        interests: { categories: [], openToAny: false },
        acquisition: {},
        startedAt: null,
        snoozedAt: null,
        completedAt: null,
    },
    checklist: {
        collapsed: false,
        complete: false,
        completedCount: 0,
        totalCount: 3,
        items: [],
    },
}

describe('CandidateOnboardingDialog', () => {
    beforeEach(() => {
        mocks.saveInterests.mockReset().mockResolvedValue(onboarding)
        mocks.saveAcquisition.mockReset().mockResolvedValue(onboarding)
        mocks.snooze.mockReset().mockResolvedValue(onboarding)
    })

    it('saves each questionnaire step and completes with a controlled source', async () => {
        const close = vi.fn()
        render(<CandidateOnboardingDialog open onboarding={onboarding} onCloseForVisit={close} />)

        expect(screen.getByRole('dialog')).toHaveAccessibleName('Personalize your Jobs Lounge experience')
        fireEvent.click(screen.getByLabelText('Technology & ICT'))
        fireEvent.click(screen.getByRole('button', { name: /Continue/ }))

        await waitFor(() => expect(mocks.saveInterests).toHaveBeenCalledWith({
            categories: ['Technology & ICT'],
            openToAny: false,
        }))
        expect(await screen.findByText('How did you hear about Jobs Lounge?')).toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Search engine'))
        fireEvent.click(screen.getByRole('button', { name: /Finish setup/ }))

        await waitFor(() => expect(mocks.saveAcquisition).toHaveBeenCalledWith({ source: 'search' }))
        expect(close).toHaveBeenCalled()
    })

    it('persists the current step when setup is skipped', async () => {
        const close = vi.fn()
        render(<CandidateOnboardingDialog open onboarding={onboarding} onCloseForVisit={close} />)

        fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }))

        await waitFor(() => expect(mocks.snooze).toHaveBeenCalledWith(1))
        expect(close).toHaveBeenCalled()
    })

    it('enforces the category maximum and Open-to-any exclusivity', () => {
        render(<CandidateOnboardingDialog open onboarding={onboarding} onCloseForVisit={vi.fn()} />)

        fireEvent.click(screen.getByLabelText('FMCG'))
        fireEvent.click(screen.getByLabelText('Technology & ICT'))
        fireEvent.click(screen.getByLabelText('Consulting & Strategy'))
        expect(screen.getByText('3 of 3 selected')).toBeInTheDocument()
        expect(screen.getByLabelText('Healthcare & Pharmaceuticals')).toBeDisabled()

        fireEvent.click(screen.getByLabelText(/Open to any category/))
        expect(screen.getByLabelText('FMCG')).not.toBeChecked()
        expect(screen.getByLabelText('Technology & ICT')).not.toBeChecked()
    })
})
