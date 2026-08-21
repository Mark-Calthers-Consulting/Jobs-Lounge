import { z } from 'zod'

export const AUTH_LIMITS = {
    nameCharacters: 80,
    emailCharacters: 254,
    passwordCharacters: 8,
    passwordBytes: 72,
} as const

const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}'’ -]*$/u
const phonePattern = /^\+?\d{7,15}$/

export const normalizeTelephone = (value: string) => {
    const compact = value.trim().replace(/[\s().-]/g, '')
    return compact.startsWith('00') ? `+${compact.slice(2)}` : compact
}

const passwordByteLength = (value: string) => new TextEncoder().encode(value).length

const nameSchema = z.string()
    .trim()
    .min(1, 'Enter your name.')
    .max(AUTH_LIMITS.nameCharacters, `Use ${AUTH_LIMITS.nameCharacters} characters or fewer.`)
    .regex(namePattern, 'Use letters, spaces, apostrophes, or hyphens only.')

const passwordSchema = z.string()
    .min(AUTH_LIMITS.passwordCharacters, `Use at least ${AUTH_LIMITS.passwordCharacters} characters.`)
    .refine(
        (value) => passwordByteLength(value) <= AUTH_LIMITS.passwordBytes,
        `Use no more than ${AUTH_LIMITS.passwordBytes} bytes (some symbols count as multiple bytes).`,
    )

export const loginSchema = z.object({
    email: z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.'),
    password: z.string().min(1, 'Enter your password.'),
})

export const registrationSchema = z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    telephone: z.string()
        .trim()
        .min(1, 'Enter your phone number.')
        .transform(normalizeTelephone)
        .refine((value) => phonePattern.test(value), 'Enter 7 to 15 digits, optionally beginning with +.'),
    email: z.string()
        .trim()
        .min(1, 'Enter your email address.')
        .max(AUTH_LIMITS.emailCharacters, 'Email address is too long.')
        .email('Enter a valid email address.')
        .transform((value) => value.toLowerCase()),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
    email: z.string()
        .trim()
        .min(1, 'Enter your email address.')
        .max(AUTH_LIMITS.emailCharacters, 'Email address is too long.')
        .email('Enter a valid email address.')
        .transform((value) => value.toLowerCase()),
})

export const passwordResetSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
})

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.password, {
    message: 'Choose a password different from your current password.',
    path: ['password'],
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegistrationFormInput = z.input<typeof registrationSchema>
export type RegistrationFormValues = z.output<typeof registrationSchema>
export type ForgotPasswordFormInput = z.input<typeof forgotPasswordSchema>
export type ForgotPasswordFormValues = z.output<typeof forgotPasswordSchema>
export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
