import { describe, expect, it } from 'vitest'

import { getJobDetailSuggestions } from './jobDetailSuggestions'

const baseContext = {
  category: '',
  jobType: 'Full-time',
  level: 'Mid',
  workMode: 'On-site',
}

describe('job detail suggestions', () => {
  it('returns concise general suggestions before a category is selected', () => {
    const suggestions = getJobDetailSuggestions('benefits', baseContext)

    expect(suggestions).toContain('Competitive salary')
    expect(suggestions).toContain('Health insurance')
  })

  it('places category-specific suggestions before general suggestions', () => {
    const suggestions = getJobDetailSuggestions('skills', {
      ...baseContext,
      category: 'Technology & ICT',
    })

    expect(suggestions[0]).toBe('Software development')
    expect(suggestions).toContain('Problem solving')
  })

  it('adds setup-specific suggestions without duplicates', () => {
    const suggestions = getJobDetailSuggestions('benefits', {
      ...baseContext,
      jobType: 'Internship',
      workMode: 'Remote',
    })

    expect(suggestions).toContain('Remote-work support')
    expect(suggestions).toContain('Structured mentorship')
    expect(new Set(suggestions).size).toBe(suggestions.length)
  })
})
