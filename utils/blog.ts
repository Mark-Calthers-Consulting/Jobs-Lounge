export const slugifyArticleTitle = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-')

const plainArticleText = (content: string) => content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const articleExcerpt = (content: string, maxLength = 200) => {
  const plain = plainArticleText(content)

  if (plain.length <= maxLength) return plain
  const candidate = plain.slice(0, maxLength + 1)
  const boundary = candidate.lastIndexOf(' ')
  return `${candidate.slice(0, boundary > 120 ? boundary : maxLength).trim()}…`
}

export const articleReadingMinutes = (content: string, wordsPerMinute = 225) => {
  const words = plainArticleText(content).split(/\s+/u).filter(Boolean).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export const BLOG_COVER_MAX_BYTES = 5 * 1024 * 1024
export const BLOG_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type BlogCoverDimensions = { width: number; height: number }

export const validateBlogCoverFile = (
  file: File,
  dimensions?: BlogCoverDimensions,
) => {
  if (!BLOG_COVER_TYPES.includes(file.type as typeof BLOG_COVER_TYPES[number])) {
    return 'Choose a JPEG, PNG, or WebP image.'
  }
  if (file.size > BLOG_COVER_MAX_BYTES) return 'Choose an image no larger than 5MB.'
  if (dimensions && (dimensions.width < 800 || dimensions.height < 450)) {
    return 'Choose an image that is at least 800 by 450 pixels.'
  }
  if (dimensions && (dimensions.width > 10_000 || dimensions.height > 10_000)) {
    return 'Choose an image with smaller dimensions.'
  }
  return null
}

export const readImageDimensions = (file: File): Promise<BlogCoverDimensions> => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const image = new window.Image()
  image.onload = () => {
    URL.revokeObjectURL(url)
    resolve({ width: image.naturalWidth, height: image.naturalHeight })
  }
  image.onerror = () => {
    URL.revokeObjectURL(url)
    reject(new Error('The selected file is not a readable image.'))
  }
  image.src = url
})
