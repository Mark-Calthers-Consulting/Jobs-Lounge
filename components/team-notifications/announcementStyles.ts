import type { TeamAnnouncementType } from '@/types/types'

export const announcementTypeTone: Record<TeamAnnouncementType, string> = {
  General: 'bg-slate-100 text-slate-700',
  'Feature update': 'bg-blue-50 text-blue-800',
  Maintenance: 'bg-amber-50 text-amber-800',
  'Action required': 'bg-red-50 text-red-800',
}
