"use client"

import { useCallback, useEffect, useId, useRef } from "react"
import { AiOutlineClose } from "react-icons/ai"
import Button from "./Button"

interface ModalProps {
    isOpen?: boolean
    onClose: () => void
    onSubmit: () => void
    title?: string
    body?: React.ReactElement
    footer?: React.ReactElement
    actionLabel: string
    disabled?: boolean
}


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, title, body, footer, actionLabel, disabled }) => {
    const titleId = useId()
    const bodyId = useId()
    const dialogRef = useRef<HTMLDivElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    const handleClose = useCallback(() => {
        if (disabled) return

        onClose()
    }, [disabled, onClose])

    const handleSubmit = useCallback(() => {
        if (disabled) return
        onSubmit()
    }, [disabled, onSubmit])

    useEffect(() => {
        if (!isOpen) return

        const previouslyFocused = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        if (disabled) dialogRef.current?.focus()
        else closeButtonRef.current?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                handleClose()
                return
            }

            if (event.key !== 'Tab' || !dialogRef.current) return
            const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ))
            if (focusable.length === 0) {
                event.preventDefault()
                dialogRef.current.focus()
                return
            }

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
    }, [disabled, handleClose, isOpen])

    if (!isOpen) {
        return null
    }
    
    return (
        <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 bg-black/70"
        >
            <button
                type="button"
                tabIndex={-1}
                aria-label="Close dialog"
                onClick={handleClose}
                disabled={disabled}
                className="absolute inset-0 cursor-default"
            />
            <div className="relative w-full md:w-3/6 my-6 mx-auto lg:max-w-3xl h-full md:h-auto">
                {/* Modal Content */}
                <div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={body ? bodyId : undefined}
                    tabIndex={-1}
                    className="h-full lg:h-auto border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-[#222]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-10 rounded-t">
                        <h2 id={titleId} className="text-3xl font-semibold text-white">{title}</h2>
                        <button ref={closeButtonRef} type="button" aria-label="Close dialog" onClick={handleClose} disabled={disabled} className="p-1 ml-auto border-0 text-white hover:opacity-70 transition disabled:cursor-wait disabled:opacity-50"><AiOutlineClose aria-hidden="true" size={24} /></button>
                    </div>
                    {/* Body */}
                    <div id={bodyId} className="relative p-10 flex-auto text-white">{body}</div>
                    {/* Footer */}
                    <div className="flex flex-col gap-2 p-10">
                        <Button disabled={disabled} label={actionLabel} secondary fullwidth large onClick={handleSubmit} />{footer}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal
