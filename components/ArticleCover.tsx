import Image from 'next/image'
import {
  FiBookOpen,
  FiBriefcase,
  FiFileText,
  FiMessageCircle,
  FiSearch,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

import type { BlogCategory } from '@/constants/enums'
import type { BlogPost, BlogPostSummary } from '@/types/types'

type CategoryArtwork = {
  background: string
  foreground: string
  line: string
  icon: IconType
}

export const BLOG_CATEGORY_ARTWORK: Record<BlogCategory, CategoryArtwork> = {
  'Job search': { background: 'bg-[#e9f0f8]', foreground: 'text-[#174a78]', line: 'border-[#b9cde1]', icon: FiSearch },
  'CV & applications': { background: 'bg-[#eef0f8]', foreground: 'text-[#343b75]', line: 'border-[#c8cce2]', icon: FiFileText },
  Interviews: { background: 'bg-[#edf4f2]', foreground: 'text-[#275f57]', line: 'border-[#c5dcd7]', icon: FiMessageCircle },
  'Career growth': { background: 'bg-[#f1f3ea]', foreground: 'text-[#51612f]', line: 'border-[#d4dbc0]', icon: FiTrendingUp },
  Workplace: { background: 'bg-[#f4f0ec]', foreground: 'text-[#6d4b37]', line: 'border-[#ded0c5]', icon: FiUsers },
  'Hiring & recruitment': { background: 'bg-[#edf2f7]', foreground: 'text-[#344e68]', line: 'border-[#c8d5e2]', icon: FiBriefcase },
  General: { background: 'bg-[#f1f2f4]', foreground: 'text-[#475569]', line: 'border-[#d3d7dc]', icon: FiBookOpen },
}

type ArticleCoverProps = {
  post: Pick<BlogPost | BlogPostSummary, 'title' | 'category' | 'coverImage'>
  sizes: string
  className?: string
  priority?: boolean
}

const ArticleCover = ({ post, sizes, className = '', priority = false }: ArticleCoverProps) => {
  if (post.coverImage) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
        <Image
          src={post.coverImage.secureUrl}
          alt={post.coverImage.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    )
  }

  const artwork = BLOG_CATEGORY_ARTWORK[post.category] || BLOG_CATEGORY_ARTWORK.General
  const Icon = artwork.icon
  return (
    <div
      className={`relative overflow-hidden ${artwork.background} ${artwork.foreground} ${className}`}
      aria-hidden="true"
    >
      <div className={`absolute -right-12 -top-20 size-52 rounded-full border ${artwork.line}`} />
      <div className={`absolute -bottom-28 -left-8 size-48 rounded-full border ${artwork.line}`} />
      <div className="relative flex h-full items-end justify-between gap-4 p-5">
        <p className="max-w-[13rem] text-sm font-semibold leading-5">{post.category}</p>
        <Icon className="shrink-0 text-3xl opacity-75" />
      </div>
    </div>
  )
}

export default ArticleCover
