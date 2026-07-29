import { z } from 'zod'

import { AUTH_LIMITS, normalizeTelephone } from './authSchema'

const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}'’ -]*$/u
const phonePattern = /^\+?\d{7,15}$/

const staffName = z.string()
    .trim()
    .min(1, 'Enter a name.')
    .max(AUTH_LIMITS.nameCharacters, `Use ${AUTH_LIMITS.nameCharacters} characters or fewer.`)
    .regex(namePattern, 'Use letters, spaces, apostrophes, or hyphens only.')

export const staffProfileSchema = z.object({
    firstName: staffName,
    lastName: staffName,
    telephone: z.string()
        .trim()
        .min(1, 'Enter a phone number.')
        .transform(normalizeTelephone)
        .refine((value) => phonePattern.test(value), 'Enter 7 to 15 digits, optionally beginning with +.'),
})

export type StaffProfileInput = z.input<typeof staffProfileSchema>
export type StaffProfileValues = z.output<typeof staffProfileSchema>
