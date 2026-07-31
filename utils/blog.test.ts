import { describe, expect, it } from 'vitest'

import {
  articleExcerpt,
  slugifyArticleTitle,
  validateBlogCoverFile,
} from './blog'

describe('blog editorial helpers', () => {
  it('creates stable URL-safe slugs from article titles', () => {
    expect(slugifyArticleTitle('  A Better Résumé Guide  ')).toBe('a-better-resume-guide')
    expect(slugifyArticleTitle('Career & Work: What’s Next?')).toBe('career-work-what-s-next')
  })

  it('turns Markdown into a concise card excerpt', () => {
    const excerpt = articleExcerpt(
      `# Resume guidance\n\n${'Use clear language and measurable outcomes. '.repeat(10)}`,
    )
    expect(excerpt).not.toContain('#')
    expect(excerpt).toMatch(/^Resume guidance Use clear language/)
    expect(excerpt.endsWith('…')).toBe(true)
    expect(excerpt.length).toBeLessThanOrEqual(201)
  })

  it('validates cover image type, size, and dimensions before upload', () => {
    const valid = new File(['image'], 'cover.webp', { type: 'image/webp' })
    expect(validateBlogCoverFile(valid, { width: 1600, height: 900 })).toBeNull()

    const unsupported = new File(['image'], 'cover.gif', { type: 'image/gif' })
    expect(validateBlogCoverFile(unsupported)).toMatch(/JPEG/)

    expect(validateBlogCoverFile(valid, { width: 640, height: 360 })).toMatch(/800 by 450/)
  })
})
