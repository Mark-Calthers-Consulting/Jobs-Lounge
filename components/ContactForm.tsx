'use client'

import { FormEvent, useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { toast } from 'sonner'

import { useSubmitContactMessage } from '@/hooks/useContact'

const initialForm = {
    name: '',
    email: '',
    telephone: '',
    subject: '',
    message: '',
}

const normalizeTelephone = (value: string) => {
    const compact = value.trim().replace(/[\s().-]/g, '')
    return compact.startsWith('00') ? `+${compact.slice(2)}` : compact
}

const telephoneIsValid = (value: string) => /^\+?\d{7,15}$/.test(normalizeTelephone(value))

const ContactForm = (): React.JSX.Element => {
    const [form, setForm] = useState(initialForm)
    const [sent, setSent] = useState(false)
    const [telephoneError, setTelephoneError] = useState('')
    const [submissionError, setSubmissionError] = useState('')
    const submit = useSubmitContactMessage()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSent(false)
        setSubmissionError('')

        if (form.telephone.trim() && !telephoneIsValid(form.telephone)) {
            setTelephoneError('Enter a valid telephone number with 7 to 15 digits.')
            return
        }
        setTelephoneError('')

        try {
            await submit.mutateAsync(form)
            setForm(initialForm)
            setSent(true)
            toast.success('Your message has been sent')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to send your message'
            setSubmissionError(message)
            toast.error(message)
        }
    }

    const inputClassName = 'min-h-11 w-full rounded-[3px] border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400'
    const labelClassName = 'mb-2 block text-sm font-semibold text-slate-800'

    return (
        <form
            onSubmit={handleSubmit}
            className="self-start overflow-hidden rounded-[6px] border border-slate-200 bg-white"
            aria-labelledby="contact-form-title"
            aria-busy={submit.isPending}
        >
            <div className="bg-[#101A35] px-5 py-6 text-white sm:px-8 sm:py-7">
                <h2
                    id="contact-form-title"
                    className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl"
                >
                    Send us a message
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                    Complete the form and we&apos;ll send your message to the Jobs Lounge support team.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                    Fields marked <span className="font-semibold text-red-300">*</span> are required.
                </p>
            </div>

            <div className="px-5 py-7 sm:px-8 sm:py-8">
                <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
                    <div>
                        <label className={labelClassName} htmlFor="contact-name">
                            Full name <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                            required
                            minLength={2}
                            maxLength={120}
                            autoComplete="name"
                            type="text"
                            id="contact-name"
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className={labelClassName} htmlFor="contact-email">
                            Email address <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                            required
                            maxLength={320}
                            autoComplete="email"
                            type="email"
                            id="contact-email"
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className={labelClassName} htmlFor="contact-telephone">
                            Telephone <span className="font-normal text-slate-500">(optional)</span>
                        </label>
                        <input
                            maxLength={40}
                            autoComplete="tel"
                            inputMode="tel"
                            type="tel"
                            id="contact-telephone"
                            value={form.telephone}
                            onChange={(event) => {
                                setForm({ ...form, telephone: event.target.value })
                                if (telephoneError) setTelephoneError('')
                            }}
                            onBlur={() => {
                                if (form.telephone.trim() && !telephoneIsValid(form.telephone)) {
                                    setTelephoneError('Enter a valid telephone number with 7 to 15 digits.')
                                }
                            }}
                            aria-invalid={telephoneError ? 'true' : undefined}
                            aria-describedby="contact-telephone-help"
                            className={inputClassName}
                            placeholder="+234 902 888 8885"
                        />
                        <p
                            id="contact-telephone-help"
                            className={`mt-1.5 text-xs ${telephoneError ? 'text-red-700' : 'text-slate-500'}`}
                        >
                            {telephoneError || 'Include your country code if you would like a callback.'}
                        </p>
                    </div>

                    <div>
                        <label className={labelClassName} htmlFor="contact-subject">
                            Subject <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                            required
                            minLength={3}
                            maxLength={200}
                            type="text"
                            id="contact-subject"
                            value={form.subject}
                            onChange={(event) => setForm({ ...form, subject: event.target.value })}
                            className={inputClassName}
                        />
                    </div>
                </div>

                <div className="mt-7">
                    <div className="mb-1 flex items-center justify-between gap-4">
                        <label className="block text-sm font-semibold text-slate-800" htmlFor="contact-message">
                            Message <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <span className="text-xs text-slate-500" aria-hidden="true">
                            {form.message.length}/5000
                        </span>
                    </div>
                    <textarea
                        required
                        minLength={10}
                        maxLength={5000}
                        id="contact-message"
                        rows={6}
                        value={form.message}
                        onChange={(event) => setForm({ ...form, message: event.target.value })}
                        className={`${inputClassName} resize-y`}
                    />
                </div>

                {submissionError && (
                    <p role="alert" className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {submissionError}
                    </p>
                )}
                {sent && (
                    <p role="status" className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                        Thanks—we have received your message.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submit.isPending}
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[3px] bg-[#003B6D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002F57] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                >
                    {submit.isPending ? 'Sending…' : 'Send message'}
                    {!submit.isPending && <FiArrowUpRight aria-hidden="true" />}
                </button>
            </div>
        </form>
    )
}

export default ContactForm
