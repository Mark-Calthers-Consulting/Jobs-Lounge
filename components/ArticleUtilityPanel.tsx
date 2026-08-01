'use client'

import { useState } from 'react'
import { BsLinkedin } from 'react-icons/bs'
import { FaXTwitter } from 'react-icons/fa6'
import { FiAlertCircle, FiCheck, FiLink } from 'react-icons/fi'

import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import type { BlogCategory } from '@/constants/enums'
import { formatDateInTimeZone } from '@/utils/dateTime'

type ArticleUtilityPanelProps = {
  author: string
  category: BlogCategory
  publishedAt: string
  readingMinutes: number
  title: string
  url: string
  layout: 'mobile' | 'desktop'
}

const ArticleUtilityPanel = ({
  author,
  category,
  publishedAt,
  readingMinutes,
  title,
  url,
  layout,
}: ArticleUtilityPanelProps) => {
  const { timeZone } = usePlatformSettings()
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  const metadata = [
    { label: 'Written by', value: author },
    {
      label: 'Published',
      value: (
        <time dateTime={publishedAt}>
          {formatDateInTimeZone(publishedAt, timeZone, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      ),
    },
    { label: 'Reading time', value: `${readingMinutes} min read` },
    { label: 'Category', value: category },
  ]

  const shareClass = 'inline-flex size-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:border-[#184aa2] hover:text-[#184aa2] focus-visible:outline-[#1B1F87]'
  const copyLabel = copyStatus === 'copied'
    ? 'Article link copied'
    : copyStatus === 'failed'
      ? 'Copy failed; try again'
      : 'Copy article link'

  return (
    <div className={layout === 'desktop' ? 'space-y-6' : 'border-y border-slate-200 py-5'}>
      <dl className={layout === 'desktop'
        ? 'space-y-5 border-b border-slate-200 pb-6'
        : 'grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4'}
      >
        {metadata.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-semibold leading-5 text-[#101A35]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className={layout === 'desktop'
        ? ''
        : 'mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-4'}
      >
        <p className="text-xs font-medium text-slate-500">Share article</p>
        <div className={layout === 'desktop' ? 'mt-3 flex gap-2' : 'flex gap-2'}>
          <button
            type="button"
            onClick={() => void copyLink()}
            className={`${shareClass} ${
              copyStatus === 'copied'
                ? 'border-emerald-300 text-emerald-700'
                : copyStatus === 'failed'
                  ? 'border-red-300 text-red-700'
                  : ''
            }`}
            aria-label={copyLabel}
            title={copyLabel}
          >
            {copyStatus === 'copied'
              ? <FiCheck aria-hidden="true" />
              : copyStatus === 'failed'
                ? <FiAlertCircle aria-hidden="true" />
                : <FiLink aria-hidden="true" />}
          </button>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={shareClass}
            aria-label="Share article on LinkedIn (opens in a new tab)"
            title="Share on LinkedIn"
          >
            <BsLinkedin aria-hidden="true" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={shareClass}
            aria-label="Share article on X (opens in a new tab)"
            title="Share on X"
          >
            <FaXTwitter aria-hidden="true" />
          </a>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {copyStatus === 'copied'
          ? 'Article link copied.'
          : copyStatus === 'failed'
            ? 'Unable to copy the article link.'
            : ''}
      </p>
    </div>
  )
}

export default ArticleUtilityPanel
