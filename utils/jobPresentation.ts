export const publicEmployerName = (name: string) => {
  const normalizedName = name.trim()

  if (!normalizedName || /^undisclosed (employer|company)$/i.test(normalizedName)) {
    return 'Confidential employer'
  }

  return normalizedName
}
