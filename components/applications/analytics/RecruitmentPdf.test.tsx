// @vitest-environment node
import React from 'react'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { describe, expect, it, vi } from 'vitest'
import { recruitmentReport } from '@/test/fixtures/recruitmentReport'
import { RecruitmentReportDocument, registerReportFonts } from './RecruitmentPdf'

vi.mock('@/api/applicationWorkspace', () => ({ saveDownloadedFile: vi.fn() }))

describe('real visual PDF generation', () => {
  for (const [name, options] of [
    ['standard', {}],
    ['empty', { empty: true }],
    ['large-long-titles', { large: true }],
    ['full-year', { days: 366 }],
  ] as const)
    it(`embeds assets and generates exactly two A4 pages for ${name}`, async () => {
      const root = path.resolve('public')
      registerReportFonts(root)
      const bytes = await renderToBuffer(
        <RecruitmentReportDocument report={recruitmentReport(options)} assetRoot={root} />,
      )
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      expect(bytes.toString('latin1').match(/\/Type \/Page\b/g) || []).toHaveLength(2)
      const sizes = [...bytes.toString('latin1').matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)]
      expect(sizes).toHaveLength(2)
      for (const [, width, height] of sizes) {
        expect(Number(width)).toBeCloseTo(595.28, 1)
        expect(Number(height)).toBeCloseTo(841.89, 1)
      }
      expect(bytes.toString('latin1')).toContain('/FontFile2')
      expect(bytes.toString('latin1')).toContain('/Subtype /Image')
      if (process.env.REPORT_ARTIFACT_DIR) {
        await mkdir(process.env.REPORT_ARTIFACT_DIR, { recursive: true })
        await writeFile(path.join(process.env.REPORT_ARTIFACT_DIR, `${name}.pdf`), bytes)
      }
    }, 60000)
})
