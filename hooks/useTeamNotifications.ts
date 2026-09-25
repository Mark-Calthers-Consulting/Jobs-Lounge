import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveTeamAnnouncement,
  createTeamAnnouncement,
  dismissImportantTeamAnnouncement,
  fetchTeamAnnouncements,
  fetchTeamNotifications,
  markAllTeamNotificationsRead,
  updateTeamAnnouncement,
} from '@/api/teamNotifications'
import type { TeamNotificationResponse } from '@/types/types'

export const useTeamNotifications = (page = 1, limit = 20, enabled = true) => useQuery({
  queryKey: ['teamNotifications', page, limit],
  queryFn: () => fetchTeamNotifications(page, limit),
  enabled,
  staleTime: 60_000,
  refetchInterval: 5 * 60_000,
  refetchIntervalInBackground: false,
})

export const useMarkAllTeamNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllTeamNotificationsRead,
    onSuccess: () => {
      queryClient.setQueriesData<TeamNotificationResponse>(
        { queryKey: ['teamNotifications'] },
        (current) => current ? {
          ...current,
          unreadCount: 0,
          data: current.data.map((item) => ({ ...item, isRead: true })),
          popup: current.popup ? { ...current.popup, isRead: true } : null,
        } : current,
      )
    },
  })
}

export const useDismissImportantTeamAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dismissImportantTeamAnnouncement,
    onSuccess: (_, announcementId) => {
      queryClient.setQueriesData<TeamNotificationResponse>(
        { queryKey: ['teamNotifications'] },
        (current) => current?.popup?._id === announcementId ? { ...current, popup: null } : current,
      )
    },
  })
}

export const useTeamAnnouncements = (page = 1) => useQuery({
  queryKey: ['teamAnnouncements', page],
  queryFn: () => fetchTeamAnnouncements(page),
})

export const useCreateTeamAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeamAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamAnnouncements'] })
      queryClient.invalidateQueries({ queryKey: ['teamNotifications'] })
    },
  })
}

export const useUpdateTeamAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTeamAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamAnnouncements'] })
      queryClient.invalidateQueries({ queryKey: ['teamNotifications'] })
    },
  })
}

export const useArchiveTeamAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveTeamAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamAnnouncements'] })
      queryClient.invalidateQueries({ queryKey: ['teamNotifications'] })
    },
  })
}
