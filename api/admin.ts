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

const pageQuery = (page = 1, limit = 20) => new URLSearchParams({
    page: String(page),
    limit: String(limit),
})

export const fetchAdminJobs = async (page = 1, limit = 20) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getAllJobs?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch vacancies")
    }

    return res.json()
}

export const fetchAllUsers = async (page = 1, limit = 20) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getAllUsers?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch users")
    }

    return res.json()
}

export const fetchTeamMembers = async (page = 1, limit = 20) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getTeamMembers?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch team")
    }

    return res.json()
}

export const fetchJobCandidates = async (page = 1, limit = 20) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getCandidates?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch candidates")
    }

    return res.json()
}

export const fetchAllApplications = async (page = 1, limit = 20) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getApplications?${pageQuery(page, limit)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    )
    if (!res.ok) {
        throw new Error("Failed to fetch applications")
    }

    return res.json()

}
