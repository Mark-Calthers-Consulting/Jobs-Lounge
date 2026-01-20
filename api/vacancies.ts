export const fetchVacancies = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`)
    if (!res.ok) {
        throw new Error("Failed to fetch vacancies")
    }
    const vacancies = await res.json()
    return vacancies.data
}