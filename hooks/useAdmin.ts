import { fetchAdminDashboard, fetchAdminJobs, fetchAllApplications, fetchAllUsers, fetchTeamMembers } from "@/api/admin"
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
    return useQuery({
        queryKey: ['adminUsers'],
        queryFn: fetchAllUsers
    })
}

export const useGetTeamMembers = () => {
    return useQuery({
        queryKey: ['teamMembers'],
        queryFn: fetchTeamMembers
    })
}

export const useAdminApplications = ()=>{
    return useQuery({
        queryKey:['adminApplications'],
        queryFn: fetchAllApplications
    })
}