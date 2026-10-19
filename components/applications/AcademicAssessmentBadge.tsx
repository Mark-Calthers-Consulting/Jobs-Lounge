import type { AcademicAssessmentResult } from '@/constants/enums'

export const academicAssessmentLabel: Record<AcademicAssessmentResult, string> = {
  meets: 'Academic criteria met',
  'one-level-below': 'One level below',
  'two-or-more-levels-below': 'Two or more levels below',
  'not-assessed': 'Not assessed',
  'not-required': 'No minimum required',
}

const tone: Record<AcademicAssessmentResult, string> = {
  meets: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'one-level-below': 'border-amber-200 bg-amber-50 text-amber-900',
  'two-or-more-levels-below': 'border-rose-200 bg-rose-50 text-rose-800',
  'not-assessed': 'border-slate-200 bg-slate-100 text-slate-700',
  'not-required': 'border-slate-200 bg-slate-50 text-slate-600',
}

export default function AcademicAssessmentBadge({ result }: { result?: AcademicAssessmentResult }) {
  if (!result || result === 'not-required') return null
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tone[result]}`}>
      {academicAssessmentLabel[result]}
    </span>
  )
}
