'use client'

import { useCallback, useEffect, useId, useRef } from 'react'
import { AiOutlineClose } from 'react-icons/ai'

const guidance = [
  {
    number: '1',
    title: 'Keep the title clean',
    detail: 'Use the role name only; put places in Location.',
  },
  {
    number: '2',
    title: 'Explain the role',
    detail: 'Summarise its purpose, scope, and expected outcomes.',
  },
  {
    number: '3',
    title: 'Separate the details',
    detail: 'Add one accurate item per responsibility, requirement, skill, or benefit.',
  },
  {
    number: '4',
    title: 'Complete the key facts',
    detail: 'Confirm location, work mode, job type, level, salary, and deadline.',
  },
  {
    number: '5',
    title: 'Check before publishing',
    detail: 'Test every link and keep unfinished listings in Draft.',
  },
] as const

const JobUploadGuideModal = ({ onClose }: { onClose: () => void }) => {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [close])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-6">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 cursor-default"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full max-w-lg overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-5 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#003B6D]">Before you begin</p>
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-slate-950">Job upload checklist</h2>
            <p id={descriptionId} className="mt-1.5 max-w-md text-sm leading-5 text-slate-600">
              Five quick checks for a complete listing.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close job upload guide"
            onClick={close}
            className="-mr-1 shrink-0 rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
          >
            <AiOutlineClose aria-hidden="true" size={20} />
          </button>
        </div>

        <ol className="divide-y divide-slate-200 px-5 sm:px-6">
          {guidance.map((item) => (
            <li key={item.number} className="grid grid-cols-[1.5rem_1fr] gap-3 py-3.5">
              <span aria-hidden="true" className="pt-0.5 text-sm font-semibold tabular-nums text-[#003B6D]">
                {item.number}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-0.5 text-sm leading-5 text-slate-600">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={close}
              className="rounded-md bg-[#003B6D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002B50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
            >
              Continue to form
            </button>
        </div>
      </div>
    </div>
  )
}

export default JobUploadGuideModal
