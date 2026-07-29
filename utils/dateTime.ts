export const formatDateInTimeZone = (
    value: string | Date,
    timeZone: string,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    },
) => {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return 'Not available'
    try {
        return new Intl.DateTimeFormat('en-NG', { ...options, timeZone }).format(date)
    } catch {
        return new Intl.DateTimeFormat('en-NG', {
            ...options,
            timeZone: 'Africa/Lagos',
        }).format(date)
    }
}

export const dateInputValueInTimeZone = (value: string, timeZone: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
    const parts = Object.fromEntries(
        formatter.formatToParts(date).map((part) => [part.type, part.value]),
    )
    return `${parts.year}-${parts.month}-${parts.day}`
}
