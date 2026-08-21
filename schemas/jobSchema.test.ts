import { describe, expect, it } from 'vitest'

import { jobFormSchema } from './jobSchema'

const validJob = {
    title: 'Frontend Developer',
    description: 'Build accessible, reliable interfaces for candidates and recruitment teams.',
    category: 'Technology & ICT',
    location: 'Lagos, Nigeria',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    level: 'Mid',
    salary: { currency: 'NGN' },
    responsibilities: ['Build and maintain accessible interfaces'],
    requirements: ['Experience building production web applications'],
    benefits: ['Learning and development support'],
    experience: 2,
    skills: ['React'],
    company: { name: 'Example Limited' },
}

describe('vacancy deadline contract', () => {
    it('defaults new vacancies to Draft', () => {
        expect(jobFormSchema.parse(validJob).status).toBe('Draft')
    })

    it('accepts calendar dates and legacy ISO timestamps', () => {
        expect(jobFormSchema.safeParse({ ...validJob, deadline: '2026-07-29' }).success).toBe(true)
        expect(jobFormSchema.safeParse({
            ...validJob,
            deadline: '2026-07-29T12:00:00.000Z',
        }).success).toBe(true)
    })

    it('rejects unsupported deadline strings', () => {
        expect(jobFormSchema.safeParse({ ...validJob, deadline: 'next Friday' }).success).toBe(false)
    })
})

describe('vacancy content requirements', () => {
    it('requires a meaningful main description', () => {
        const result = jobFormSchema.safeParse({ ...validJob, description: 'Too short' })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('Description must be at least 50 characters')
        }
    })

    it.each(['responsibilities', 'requirements', 'benefits', 'skills'] as const)(
        'requires at least one %s entry',
        (field) => {
            expect(jobFormSchema.safeParse({ ...validJob, [field]: [] }).success).toBe(false)
        },
    )

    it('allows concise structured entries', () => {
        expect(jobFormSchema.safeParse({
            ...validJob,
            responsibilities: ['Sell'],
            requirements: ['OND'],
            benefits: ['Pension'],
            skills: ['Excel'],
        }).success).toBe(true)
    })
})
