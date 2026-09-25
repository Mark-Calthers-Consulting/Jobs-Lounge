import { apiPath } from './base'
import { csrfFetch } from './csrf'
import { readApiResponse } from './errors'
import type {
  ApiSuccess,
  PaginatedResponse,
  TeamAnnouncement,
  TeamAnnouncementPayload,
  TeamAnnouncementUpdatePayload,
  TeamNotificationResponse,
} from '@/types/types'

const paginationQuery = (page: number, limit: number) => new URLSearchParams({
  page: String(page),
  limit: String(limit),
})

export const fetchTeamNotifications = async (page = 1, limit = 20): Promise<TeamNotificationResponse> => {
  const response = await fetch(`${apiPath('/admin/notifications')}?${paginationQuery(page, limit)}`, {
    credentials: 'include',
    cache: 'no-store',
  })
  return readApiResponse<TeamNotificationResponse>(response, 'Unable to load notifications')
}

export const markAllTeamNotificationsRead = async (): Promise<void> => {
  const response = await csrfFetch(apiPath('/admin/notifications/mark-all-seen'), { method: 'POST' })
  await readApiResponse<ApiSuccess<{ seenAt: string }>>(response, 'Unable to mark notifications as read')
}

export const dismissImportantTeamAnnouncement = async (announcementId: string): Promise<void> => {
  const response = await csrfFetch(
    apiPath(`/admin/notifications/${encodeURIComponent(announcementId)}/dismiss-popup`),
    { method: 'POST' },
  )
  await readApiResponse<ApiSuccess<{ popupSeenAt: string }>>(response, 'Unable to dismiss this announcement')
}

export const fetchTeamAnnouncements = async (page = 1, limit = 20): Promise<PaginatedResponse<TeamAnnouncement>> => {
  const response = await fetch(`${apiPath('/admin/announcements')}?${paginationQuery(page, limit)}`, {
    credentials: 'include',
    cache: 'no-store',
  })
  return readApiResponse<PaginatedResponse<TeamAnnouncement>>(response, 'Unable to load announcements')
}

export const createTeamAnnouncement = async (payload: TeamAnnouncementPayload): Promise<TeamAnnouncement> => {
  const response = await csrfFetch(apiPath('/admin/announcements'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await readApiResponse<ApiSuccess<TeamAnnouncement>>(response, 'Unable to save announcement')
  return result.data
}

export const updateTeamAnnouncement = async ({
  announcementId,
  ...payload
}: TeamAnnouncementUpdatePayload): Promise<TeamAnnouncement> => {
  const response = await csrfFetch(apiPath(`/admin/announcements/${encodeURIComponent(announcementId)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await readApiResponse<ApiSuccess<TeamAnnouncement>>(response, 'Unable to update announcement')
  return result.data
}

export const archiveTeamAnnouncement = async (announcementId: string): Promise<TeamAnnouncement> => {
  const response = await csrfFetch(
    apiPath(`/admin/announcements/${encodeURIComponent(announcementId)}/archive`),
    { method: 'POST' },
  )
  const result = await readApiResponse<ApiSuccess<TeamAnnouncement>>(response, 'Unable to archive announcement')
  return result.data
}
