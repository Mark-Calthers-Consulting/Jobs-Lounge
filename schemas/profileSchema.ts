import { USER_GENDERS, USER_MARITAL_STATUSES, USER_NYSC_STATUSES } from '@/constants/enums'
import { DOCUMENT_URL_ERROR, isValidDocumentUrl } from '@/utils/documentUrl'
import { z } from 'zod'

const optionalText = (maximum: number) => z.string().trim().max(maximum).optional()
const telephone = z.string().trim()
  .regex(/^\+?[0-9]{7,15}$/, 'Enter 7 to 15 digits, optionally beginning with +')
const optionalTelephone = z.string().trim()
  .refine((value) => !value || /^\+?[0-9]{7,15}$/.test(value), 'Enter 7 to 15 digits, optionally beginning with +')
const optionalHttpUrl = z.string().trim().refine((value) => {
  return !value || isValidDocumentUrl(value)
}, DOCUMENT_URL_ERROR)

export const identityProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  middleName: optionalText(80),
  otherName: z.string().trim().min(1, 'Other name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  dob: z.string().min(1, 'Date of birth is required').refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime())
      && date.toISOString().slice(0, 10) === value
      && date <= new Date()
  }, 'Enter a valid date of birth that is not in the future'),
  gender: z.union([z.enum(USER_GENDERS), z.literal('')])
    .refine((value): boolean => value !== '', 'Select a gender option'),
  telephone,
  whatsapp: optionalTelephone,
})

export const professionalProfileSchema = z.object({
  highestEducation: z.string().trim().min(1, 'Highest education is required').max(120),
  nyscStatus: z.enum(USER_NYSC_STATUSES, { error: 'Select your NYSC status' }),
  yearCompletedNysc: z.string(),
  postNyscExperience: z.string()
    .regex(/^\d+$/, 'Enter a whole number from 0 to 60')
    .refine((value) => Number(value) <= 60, 'Enter a whole number from 0 to 60'),
}).superRefine((values, context) => {
  if (values.nyscStatus !== 'completed') return
  const year = Number(values.yearCompletedNysc)
  const currentYear = new Date().getFullYear()
  if (!/^\d{4}$/.test(values.yearCompletedNysc) || year < 1960 || year > currentYear) {
    context.addIssue({
      code: 'custom',
      path: ['yearCompletedNysc'],
      message: `Enter a year from 1960 to ${currentYear}`,
    })
  }
})

export const documentsProfileSchema = z.object({
  cvLink: optionalHttpUrl,
  coverLetterLink: optionalHttpUrl,
})

export const personalProfileSchema = z.object({
  maritalStatus: z.union([z.enum(USER_MARITAL_STATUSES), z.literal('')]),
  residentialAddress: optionalText(500),
})

export type IdentityProfileValues = z.infer<typeof identityProfileSchema>
export type ProfessionalProfileValues = z.infer<typeof professionalProfileSchema>
export type DocumentsProfileValues = z.infer<typeof documentsProfileSchema>
export type PersonalProfileValues = z.infer<typeof personalProfileSchema>
