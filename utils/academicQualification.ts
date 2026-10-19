import {
  ACADEMIC_QUALIFICATIONS,
  type AcademicAssessmentResult,
  type AcademicQualification,
} from '@/constants/enums'

export type AcademicAssessmentPreview = {
  result: AcademicAssessmentResult
  reason?: 'missing-candidate-qualification' | 'unrecognized-candidate-qualification'
  candidateQualification?: string
  minimumQualification?: AcademicQualification
  levelDifference?: number
}

export const assessAcademicQualification = ({
  candidateQualification,
  minimumQualification,
}: {
  candidateQualification?: string
  minimumQualification?: AcademicQualification
}): AcademicAssessmentPreview => {
  if (!minimumQualification) return { result: 'not-required' }
  const candidateRank = ACADEMIC_QUALIFICATIONS.indexOf(
    candidateQualification as AcademicQualification,
  )
  const minimumRank = ACADEMIC_QUALIFICATIONS.indexOf(minimumQualification)
  if (candidateRank < 0) {
    return {
      result: 'not-assessed',
      reason: candidateQualification
        ? 'unrecognized-candidate-qualification'
        : 'missing-candidate-qualification',
      ...(candidateQualification ? { candidateQualification } : {}),
      minimumQualification,
    }
  }
  const levelDifference = candidateRank - minimumRank
  return {
    result: levelDifference >= 0
      ? 'meets'
      : levelDifference === -1
        ? 'one-level-below'
        : 'two-or-more-levels-below',
    candidateQualification,
    minimumQualification,
    levelDifference,
  }
}

export const academicAssessmentNeedsReview = (result: AcademicAssessmentResult) => (
  ['one-level-below', 'two-or-more-levels-below', 'not-assessed'].includes(result)
)
