'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { FiImage, FiUpload, FiX } from 'react-icons/fi'

import type { BlogPost } from '@/types/types'

type BlogCoverImageFieldProps = {
  currentImage?: BlogPost['coverImage']
  previewUrl?: string
  alt: string
  removed: boolean
  disabled: boolean
  error?: string
  onChoose: (file: File) => void
  onAltChange: (value: string) => void
  onRemove: () => void
}

const BlogCoverImageField = ({
  currentImage,
  previewUrl,
  alt,
  removed,
  disabled,
  error,
  onChoose,
  onAltChange,
  onRemove,
}: BlogCoverImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const displayedImage = previewUrl || (!removed ? currentImage?.secureUrl : undefined)

  return (
    <fieldset className="border-t border-slate-200 pt-5" aria-describedby="blog-cover-help">
      <legend className="text-sm font-semibold text-slate-900">Cover image</legend>
      <p id="blog-cover-help" className="mt-1 text-xs leading-5 text-slate-500">
        Optional. Use a landscape JPEG, PNG, or WebP image, ideally 1600 × 900. Maximum 5MB.
      </p>

      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <div className="relative aspect-video">
          {displayedImage ? (
            <Image
              src={displayedImage}
              alt=""
              fill
              unoptimized={displayedImage.startsWith('blob:')}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <FiImage aria-hidden="true" className="text-3xl" />
              <span className="text-xs font-medium">No cover image selected</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white p-3">
          <input
            ref={inputRef}
            id="blog-coverImage"
            aria-label="Cover image file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onChoose(file)
              event.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-800 disabled:opacity-60"
          >
            <FiUpload aria-hidden="true" />
            {displayedImage ? 'Replace image' : 'Choose image'}
          </button>
          {displayedImage ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onRemove}
              className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold text-red-700 disabled:opacity-60"
            >
              <FiX aria-hidden="true" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p id="blog-coverImage-error" className="mt-2 text-xs text-red-700">{error}</p> : null}

      {displayedImage ? (
        <div className="mt-4">
          <label htmlFor="blog-coverImageAlt" className="block text-sm font-semibold text-slate-900">
            Alternative text
          </label>
          <input
            id="blog-coverImageAlt"
            value={alt}
            maxLength={180}
            disabled={disabled}
            onChange={(event) => onAltChange(event.target.value)}
            aria-describedby="blog-cover-alt-help"
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3"
          />
          <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
            <p id="blog-cover-alt-help">Describe meaningful imagery, or leave blank when it is decorative.</p>
            <span>{alt.length}/180</span>
          </div>
        </div>
      ) : null}
    </fieldset>
  )
}

export default BlogCoverImageField
