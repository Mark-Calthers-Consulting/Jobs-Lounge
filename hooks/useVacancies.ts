import { fetchVacancies } from "@/api/vacancies"
import { Job } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

export const useVacancies = () => {
    return useQuery<Job[]>({
        queryKey: ['vacancies'],
        queryFn: fetchVacancies
    })
}