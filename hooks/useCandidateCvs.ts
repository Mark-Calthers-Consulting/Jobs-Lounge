import { useQuery } from '@tanstack/react-query'
import { getMyCvs } from '@/api/cvs'

export const useCandidateCvs = (enabled = true) => useQuery({
  queryKey: ['candidateCvs'], queryFn: getMyCvs, enabled,
})
