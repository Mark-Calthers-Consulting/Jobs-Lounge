import type { Job } from '@/types/types'

type DeadlineJob = Pick<Job, 'deadline' | 'status'>

export const isJobDeadlinePast = (job: DeadlineJob, now = Date.now()) => {
    if (job.status !== 'Open' || !job.deadline) return false

    const deadline = new Date(job.deadline).getTime()
    return Number.isFinite(deadline) && deadline < now
}

export const formatJobDeadline = (deadline: string, timeZone = 'Africa/Lagos') => new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone,
}).format(new Date(deadline))
