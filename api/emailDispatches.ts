import { apiPath } from './base'
import { csrfFetch } from './csrf'
import { readApiResponse } from './errors'

export type EmailChannel = 'candidate' | 'newsletter'
export type BroadcastTemplate = 'candidate-message' | 'candidate-profile' | 'candidate-cv' | 'candidate-activity' | 'candidate-roundup' | 'candidate-newsletter'
export type AudienceFilters = {
  search?: string; joinedDays?: number; joinedFrom?: string; joinedTo?: string
  activity?: string; activityDays?: number; group?: string; profile?: string; cv?: string
  verified?: string; vacancyId?: string; stage?: string
}
export type EmailContent = { subject: string; message: string; preheader: string; closing: string; articleIds: string[]; vacancyIds: string[] }
export type EmailSelection = { mode: 'explicit' | 'all'; ids: string[]; excludeIds: string[] }
export type BroadcastDraft = { channel: EmailChannel; template: BroadcastTemplate; content: EmailContent; filters: AudienceFilters; selection: EmailSelection; includeTeam: boolean }
export type Dispatch = BroadcastDraft & {
  _id: string; revision: number; ownerName?: string; state: string; recipientCount: number
  candidateCount: number; teamCount: number; scheduledFor?: string; queuedAt?: string; createdAt: string
  outcomes: { sent: number; dead: number; skipped: number; cancelled: number }; live?: Record<string, number>
}
export type Recipient = { id: string; name: string; email: string; audience: 'candidate' | 'team'; profileComplete?: boolean; hasCv?: boolean; emailVerified?: boolean; lastActiveAt?: string | null }
export type Paging = { page: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }
export type RecipientResult = { data: Recipient[]; pagination: Paging; vacancies: { id: string; title: string; location: string }[] }
export type Review = { fingerprint: string; recipientCount: number; candidateCount: number; teamCount: number; recipients: Pick<Recipient, 'id' | 'name' | 'audience'>[]; subject: string; html: string; text: string }
export type ContentOptions = { articles: { _id: string; title: string }[]; vacancies: { _id: string; title: string; locations: string[] }[] }
export type Delivery = { _id: string; recipient: string; recipientLabel?: string; status: string; attempts: number; sentAt?: string; lastFailure?: { code: string } }
export type EmailTotals = { accepted: number; sent: number; failed: number; skipped: number; cancelled: number; retryAttempts: number }
export type EmailAnalytics = { from: string; to: string; timeZone: string; reportingStartedAt: string | null; totals: Record<string, EmailTotals>; daily: (EmailTotals & { day: string; source: string; template: string; audience: string })[]; backlog: { _id: { status: string; scheduled: boolean; template: string }; count: number }[]; definition: string }

export async function dispatchRequest<T>(path = '', method = 'GET', body?: unknown): Promise<T> {
  const options: RequestInit = { method, credentials: 'include', cache: 'no-store', ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) }
  const response = await (method === 'GET' ? fetch : csrfFetch)(apiPath(`/admin/email-dispatches${path}`), options)
  return readApiResponse<T>(response, 'Unable to complete the email request')
}
export async function dispatchData<T>(path = '', method = 'GET', body?: unknown) {
  return (await dispatchRequest<{ data: T }>(path, method, body)).data
}
