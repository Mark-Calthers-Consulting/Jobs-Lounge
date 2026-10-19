import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AcademicAssessmentBadge from './AcademicAssessmentBadge'

describe('AcademicAssessmentBadge', () => {
    it.each([
        ['meets', 'Academic criteria met'],
        ['one-level-below', 'One level below'],
        ['two-or-more-levels-below', 'Two or more levels below'],
        ['not-assessed', 'Not assessed'],
    ] as const)('renders an accessible label for %s', (result, label) => {
        render(<AcademicAssessmentBadge result={result} />)
        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('hides vacancies where no academic requirement applied', () => {
        const { container } = render(<AcademicAssessmentBadge result="not-required" />)
        expect(container).toBeEmptyDOMElement()
    })
})
