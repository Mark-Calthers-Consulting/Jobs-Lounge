'use client'

import {
  addApplicationNote,
  approveApplicationExport,
  bulkUpdateApplications,
  cancelApplicationExport,
  createApplicationExportRequest,
  fetchApplicationActivity,
  fetchApplicationDetail,
  fetchApplicationFilterOptions,
  fetchApplicationExportRequests,
  fetchApplicationJobSummary,
  fetchApplicationJobs,
  fetchApplicationsOverview,
  fetchWorkspaceApplications,
  rejectApplicationExport,
  updateApplicationWorkflow,
} from '@/api/applicationWorkspace'
import type {
  ApplicationJobDirectoryFilters,
  ApplicationExportRequestFilters,
  ApplicationWorkspaceFilters,
} from '@/types/types'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export const useApplicationsOverview = () => useQuery({
  queryKey: ['applicationWorkspace', 'overview'],
  queryFn: fetchApplicationsOverview,
})

export const useApplicationJobs = (filters: ApplicationJobDirectoryFilters) => useQuery({
  queryKey: ['applicationWorkspace', 'jobs', filters],
  queryFn: () => fetchApplicationJobs(filters),
})

export const useApplicationExportRequests = (filters: ApplicationExportRequestFilters) => useQuery({
  queryKey: ['applicationWorkspace', 'exports', filters],
  queryFn: () => fetchApplicationExportRequests(filters),
})

export const useApplicationList = (filters: ApplicationWorkspaceFilters) => {
  const { cursor, ...queryFilters } = filters
  return useInfiniteQuery({
    queryKey: ['applicationWorkspace', 'list', queryFilters],
    queryFn: ({ pageParam }) => fetchWorkspaceApplications({
      ...queryFilters,
      cursor: pageParam || undefined,
    }),
    initialPageParam: cursor || '',
    getNextPageParam: (page) => page.pageInfo.nextCursor || undefined,
  })
}

export const useApplicationJobSummary = (
  jobId: string,
  filters: Omit<ApplicationWorkspaceFilters, 'jobId' | 'cursor' | 'limit' | 'status' | 'sort'>,
) => useQuery({
  queryKey: ['applicationWorkspace', 'summary', jobId, filters],
  queryFn: () => fetchApplicationJobSummary(jobId, filters),
  enabled: Boolean(jobId),
})

export const useApplicationDetail = (applicationId?: string) => useQuery({
  queryKey: ['applicationWorkspace', 'detail', applicationId],
  queryFn: () => fetchApplicationDetail(applicationId!),
  enabled: Boolean(applicationId),
})

export const useApplicationActivity = (applicationId?: string) => useInfiniteQuery({
  queryKey: ['applicationWorkspace', 'activity', applicationId],
  queryFn: ({ pageParam }) => fetchApplicationActivity({
    applicationId: applicationId!,
    cursor: pageParam || undefined,
  }),
  initialPageParam: '',
  getNextPageParam: (page) => page.pageInfo.nextCursor || undefined,
  enabled: Boolean(applicationId),
})

export const useApplicationFilterOptions = (
  candidateSearch?: string,
  jobSearch?: string,
  selectedCandidateId?: string,
  selectedJobId?: string,
) => useQuery({
  queryKey: [
    'applicationWorkspace',
    'filterOptions',
    candidateSearch || '',
    jobSearch || '',
    selectedCandidateId || '',
    selectedJobId || '',
  ],
  queryFn: () => fetchApplicationFilterOptions({
    candidateSearch,
    jobSearch,
    selectedCandidateId,
    selectedJobId,
  }),
})

const useWorkspaceMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationWorkspace'] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationWorkspace'] })
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
      queryClient.invalidateQueries({ queryKey: ['adminVacancies'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
    },
  })
}

export const useUpdateApplicationWorkflow = () => (
  useWorkspaceMutation(updateApplicationWorkflow)
)

export const useAddApplicationNote = () => (
  useWorkspaceMutation(addApplicationNote)
)

export const useBulkUpdateApplications = () => (
  useWorkspaceMutation(bulkUpdateApplications)
)

export const useCreateApplicationExportRequest = () => (
  useWorkspaceMutation(createApplicationExportRequest)
)

export const useApproveApplicationExport = () => (
  useWorkspaceMutation(approveApplicationExport)
)

export const useRejectApplicationExport = () => (
  useWorkspaceMutation(rejectApplicationExport)
)

export const useCancelApplicationExport = () => (
  useWorkspaceMutation(cancelApplicationExport)
)
