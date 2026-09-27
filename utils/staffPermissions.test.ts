import { describe, expect, it } from 'vitest'

import { hasStaffPermission, permissionForAdminPath } from './staffPermissions'

describe('staff permissions', () => {
  it('grants base email-centre permission to recruiters and super administrators', () => {
    expect(hasStaffPermission('super-admin', 'team-emails:send')).toBe(true)
    expect(hasStaffPermission('recruiter', 'team-emails:send')).toBe(true)
    expect(hasStaffPermission('admin', 'team-emails:send')).toBe(false)
    expect(permissionForAdminPath('/admin-center/emails')).toBe('team-emails:send')
  })

  it('keeps announcement management exclusive to super-admins', () => {
    expect(hasStaffPermission('super-admin', 'announcements:manage')).toBe(true)
    expect(hasStaffPermission('recruiter', 'announcements:manage')).toBe(false)
    expect(hasStaffPermission('admin', 'announcements:manage')).toBe(false)
    expect(permissionForAdminPath('/admin-center/announcements')).toBe('announcements:manage')
  })

  it('keeps application analytics exclusive to super-admins', () => {
    expect(hasStaffPermission('super-admin', 'applications:analytics')).toBe(true)
    expect(hasStaffPermission('recruiter', 'applications:analytics')).toBe(false)
    expect(hasStaffPermission('admin', 'applications:analytics')).toBe(false)
    expect(permissionForAdminPath('/admin-center/applications/analytics')).toBe('applications:analytics')
  })
})
