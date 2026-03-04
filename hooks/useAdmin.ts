import { fetchAdminDashboard, fetchAdminJobs, fetchAllUsers } from "@/api/admin"
import { Job } from "@/types/types"
import { useQuery } from "@tanstack/react-query"


export const useAdminDashboard = () => {
    return useQuery({
        queryKey: ['adminDashboard'],
        queryFn: fetchAdminDashboard
    })
}

export const useAdminVacancies = () => {
    return useQuery<Job[]>({
        queryKey: ['adminVacancies'],
        queryFn: fetchAdminJobs
    })
}

export const useAdminUsers = () => {
    return useQuery<Job[]>({
        queryKey: ['adminUsers'],
        queryFn: fetchAllUsers
    })
}