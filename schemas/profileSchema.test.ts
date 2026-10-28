import { describe, expect, it } from 'vitest'
import { identityProfileSchema, personalProfileSchema } from './profileSchema'

const identity = {
  firstName: 'Ada',
  middleName: '',
  otherName: 'Grace',
  lastName: 'Lovelace',
  dob: '1990-01-01',
  gender: 'female',
  telephone: '+2348000000000',
  whatsapp: '',
}

describe('candidate identity profile', () => {
  it('requires other name, date of birth, and a gender choice', () => {
    expect(identityProfileSchema.safeParse(identity).success).toBe(true)
    expect(identityProfileSchema.safeParse({ ...identity, otherName: '  ' }).success).toBe(false)
    expect(identityProfileSchema.safeParse({ ...identity, dob: '' }).success).toBe(false)
    expect(identityProfileSchema.safeParse({ ...identity, gender: '' }).success).toBe(false)
    expect(identityProfileSchema.safeParse({ ...identity, gender: 'unknown' }).success).toBe(false)
    expect(identityProfileSchema.safeParse({ ...identity, gender: 'prefer-not-to-say' }).success).toBe(true)
  })

  it('rejects invalid and future birth dates', () => {
    expect(identityProfileSchema.safeParse({ ...identity, dob: '1990-02-30' }).success).toBe(false)
    expect(identityProfileSchema.safeParse({ ...identity, dob: '2990-01-01' }).success).toBe(false)
  })

  it('keeps the remaining personal details optional', () => {
    expect(personalProfileSchema.safeParse({
      maritalStatus: '', residentialAddress: '',
    }).success).toBe(true)
  })
})
