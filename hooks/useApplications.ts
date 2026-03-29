import { applyToJob, cancelApplication, createJob, getAllJobApplications, getMyApplications } from "@/api/applications";
import { useMutation, useQuery } from "@tanstack/react-query";


export const useCreatejob = () => {
    return useMutation({
        mutationFn: createJob
    })
}

export const useApplyToJob = () => {
    return useMutation({
        mutationFn: applyToJob
    })
}

export const useGetMyApplications = () => {
    return useQuery({
        queryKey: ['getPersonalApplications'],
        queryFn: getMyApplications
    })
}

export const useCancelApplication = () => {
    return useMutation({
        mutationFn: cancelApplication
    })
}

export const useGetAllApplications = () => {
    return useQuery({
        queryKey: ['getAllApplications'],
        queryFn: getAllJobApplications
    })
}