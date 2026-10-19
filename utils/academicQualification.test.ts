import { describe, expect, it } from 'vitest'

import { ACADEMIC_QUALIFICATIONS } from '@/constants/enums'
import { assessAcademicQualification } from './academicQualification'

describe('academic qualification assessment', () => {
  it('uses every option as a separate strict rank', () => {
    ACADEMIC_QUALIFICATIONS.forEach((candidateQualification, candidateRank) => {
      ACADEMIC_QUALIFICATIONS.forEach((minimumQualification, minimumRank) => {
        const assessment = assessAcademicQualification({
          candidateQualification,
          minimumQualification,
        })
        const difference = candidateRank - minimumRank
        expect(assessment.levelDifference).toBe(difference)
        expect(assessment.result).toBe(
          difference >= 0
            ? 'meets'
            : difference === -1
              ? 'one-level-below'
              : 'two-or-more-levels-below',
        )
      })
    })
  })

  it('distinguishes missing, legacy and absent requirements', () => {
    expect(assessAcademicQualification({
      minimumQualification: "Bachelor's degree",
    })).toMatchObject({
      result: 'not-assessed',
      reason: 'missing-candidate-qualification',
    })
    expect(assessAcademicQualification({
      candidateQualification: 'BSc',
      minimumQualification: "Bachelor's degree",
    })).toMatchObject({
      result: 'not-assessed',
      reason: 'unrecognized-candidate-qualification',
    })
    expect(assessAcademicQualification({
      candidateQualification: 'Secondary school',
    }).result).toBe('not-required')
  })
})
