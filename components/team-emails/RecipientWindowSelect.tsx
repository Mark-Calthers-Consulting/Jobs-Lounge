'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { LuCheck, LuChevronDown } from 'react-icons/lu'

type RecipientWindowOption = {
  value: string
  label: string
}

type RecipientWindowSelectProps = {
  options: RecipientWindowOption[]
  value: string
  onChange: (value: string) => void
}

export default function RecipientWindowSelect({
  options,
  value,
  onChange,
}: RecipientWindowSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const selected = options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const openAndFocus = () => {
    setOpen(true)
    requestAnimationFrame(() => {
      const optionsList = rootRef.current?.querySelectorAll<HTMLElement>('[role="option"]')
      const index = Math.max(0, options.findIndex((option) => option.value === value))
      optionsList?.[index]?.focus()
    })
  }

  const choose = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div ref={rootRef} className="relative min-w-56">
      <span id={`${listId}-label`} className="mb-1.5 block text-xs font-semibold text-slate-700">Recipient window</span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label ${listId}-value`}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : openAndFocus())}
        onKeyDown={(event) => {
          if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
          event.preventDefault()
          openAndFocus()
        }}
        className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-lg border bg-white px-3.5 text-left text-sm font-medium text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${open ? 'border-blue-600' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
      >
        <span id={`${listId}-value`}>{selected?.label}</span>
        <LuChevronDown aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${listId}-label`}
          className="absolute left-0 z-40 mt-2 w-full min-w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
            const items = [...(rootRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])]
            if (!items.length) return
            event.preventDefault()
            const current = items.indexOf(document.activeElement as HTMLElement)
            const next = event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? items.length - 1
                : event.key === 'ArrowUp'
                  ? (current <= 0 ? items.length - 1 : current - 1)
                  : (current + 1) % items.length
            items[next]?.focus()
          }}
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => choose(option.value)}
                className={`flex min-h-10 w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 ${active ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'}`}
              >
                <span>{option.label}</span>
                {active ? <LuCheck aria-hidden="true" className="shrink-0 text-blue-700" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
