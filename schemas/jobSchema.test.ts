import { describe, expect, it } from 'vitest'

import { jobFormSchema } from './jobSchema'

const validJob = {
    title: 'Frontend Developer',
    description: 'Build accessible interfaces.',
    category: 'Technology & ICT',
    location: 'Lagos, Nigeria',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    level: 'Mid',
    salary: { currency: 'NGN' },
    responsibilities: [],
    requirements: [],
    benefits: [],
    experience: 2,
    skills: [],
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
