import { describe, expect, it } from 'vitest'

import { hasStaffPermission, permissionForAdminPath } from './staffPermissions'

describe('team email permissions', () => {
  it('grants base email-centre permission to recruiters and super administrators', () => {
    expect(hasStaffPermission('super-admin', 'team-emails:send')).toBe(true)
    expect(hasStaffPermission('recruiter', 'team-emails:send')).toBe(true)
    expect(hasStaffPermission('admin', 'team-emails:send')).toBe(false)
    expect(permissionForAdminPath('/admin-center/emails')).toBe('team-emails:send')
  })
})
