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

const dateTimePartsInTimeZone = (value: Date, timeZone: string) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    })
    return Object.fromEntries(
        formatter.formatToParts(value).map((part) => [part.type, part.value]),
    )
}

export const dateTimeInputValueInTimeZone = (value: Date, timeZone: string) => {
    if (Number.isNaN(value.getTime())) return ''
    try {
        const parts = dateTimePartsInTimeZone(value, timeZone)
        return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
    } catch {
        return ''
    }
}

export const dateTimeInputToUtc = (value: string, timeZone: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
    if (!match) return undefined
    const [, yearText, monthText, dayText, hourText, minuteText] = match
    const desired = {
        year: Number(yearText),
        month: Number(monthText),
        day: Number(dayText),
        hour: Number(hourText),
        minute: Number(minuteText),
    }
    const desiredWallTime = Date.UTC(
        desired.year,
        desired.month - 1,
        desired.day,
        desired.hour,
        desired.minute,
    )
    const calendarCheck = new Date(desiredWallTime)
    if (
        calendarCheck.getUTCFullYear() !== desired.year
        || calendarCheck.getUTCMonth() + 1 !== desired.month
        || calendarCheck.getUTCDate() !== desired.day
        || desired.hour > 23
        || desired.minute > 59
    ) return undefined

    try {
        let instant = desiredWallTime
        for (let attempt = 0; attempt < 3; attempt += 1) {
            const parts = dateTimePartsInTimeZone(new Date(instant), timeZone)
            const representedWallTime = Date.UTC(
                Number(parts.year),
                Number(parts.month) - 1,
                Number(parts.day),
                Number(parts.hour),
                Number(parts.minute),
            )
            instant += desiredWallTime - representedWallTime
        }
        const resolved = new Date(instant)
        const resolvedParts = dateTimePartsInTimeZone(resolved, timeZone)
        if (
            Number(resolvedParts.year) !== desired.year
            || Number(resolvedParts.month) !== desired.month
            || Number(resolvedParts.day) !== desired.day
            || Number(resolvedParts.hour) !== desired.hour
            || Number(resolvedParts.minute) !== desired.minute
        ) return undefined
        return resolved.toISOString()
    } catch {
        return undefined
    }
}
