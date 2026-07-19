const spreadsheetSafe = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value)
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
}

export const downloadCsv = <T>(
    filename: string,
    columns: Array<{ header: string; value: (row: T) => unknown }>,
    rows: T[],
) => {
    const csv = [
        columns.map(({ header }) => spreadsheetSafe(header)).join(','),
        ...rows.map((row) => columns.map(({ value }) => spreadsheetSafe(value(row))).join(',')),
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
}
