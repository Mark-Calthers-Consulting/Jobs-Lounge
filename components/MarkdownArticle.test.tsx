import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MarkdownArticle from './MarkdownArticle'

describe('article Markdown', () => {
  it('renders editorial structures including GFM tables', () => {
    render(
      <MarkdownArticle content={`
## Prepare well

> Clear preparation builds confidence.

- Review the role
- Practise examples

| Step | Outcome |
| --- | --- |
| Research | Better answers |
      `} />,
    )

    expect(screen.getByRole('heading', { name: 'Prepare well' })).toBeInTheDocument()
    expect(screen.getByText('Clear preparation builds confidence.')).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Better answers' })).toBeInTheDocument()
  })

  it('keeps internal links local and hardens external links', () => {
    render(
      <MarkdownArticle content="[Vacancies](/vacancies) and [external guidance](https://example.com/guide)." />,
    )

    expect(screen.getByRole('link', { name: 'Vacancies' }))
      .not.toHaveAttribute('target')
    const external = screen.getByRole('link', { name: /external guidance/ })
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
