export const fetchAdminDashboard = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/dashboard`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch dashboard data")
    }

    const dashboard = await res.json()
    return dashboard.data 
}

export const fetchAdminJobs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getAllJobs`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch vacancies")
    }

    const vacancies = await res.json()
    return vacancies.data
}

export const fetchAllUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getAllUsers`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch users")
    }

    const users = await res.json()
    return users.data

}

export const fetchAllApplications = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getApplications`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch applications")
    }

    const users = await res.json()
    return users.data

}