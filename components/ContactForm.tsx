'use client'

import { useSubmitContactMessage } from '@/hooks/useContact'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

const initialForm = { name: '', email: '', subject: '', message: '' }

const ContactForm = () => {
    const [form, setForm] = useState(initialForm)
    const [sent, setSent] = useState(false)
    const submit = useSubmitContactMessage()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSent(false)
        try {
            await submit.mutateAsync(form)
            setForm(initialForm)
            setSent(true)
            toast.success('Your message has been sent')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to send your message')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl rounded bg-[#335F84] px-6 py-10 text-white md:px-12" aria-labelledby="contact-form-title" aria-busy={submit.isPending}>
            <h2 id="contact-form-title" className="mb-5 text-2xl font-semibold">Send us a message</h2>
            <div>
                <label className="block my-3 text-lg font-medium" htmlFor="contact-name">First &amp; Last Name</label>
                <input required minLength={2} maxLength={120} autoComplete="name" type="text" id="contact-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded border border-transparent bg-white px-3 py-2 text-black" />
            </div>
            <div>
                <label className="block my-4 text-lg font-medium" htmlFor="contact-email">Email</label>
                <input required maxLength={320} autoComplete="email" type="email" id="contact-email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded border border-transparent bg-white px-3 py-2 text-black" />
            </div>
            <div>
                <label className="block my-3 text-lg font-medium" htmlFor="contact-subject">Subject</label>
                <input required minLength={3} maxLength={200} type="text" id="contact-subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="w-full rounded border border-transparent bg-white px-3 py-2 text-black" />
            </div>
            <div>
                <label className="block my-3 text-lg font-medium" htmlFor="contact-message">Message</label>
                <textarea required minLength={10} maxLength={5000} id="contact-message" rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="w-full rounded border border-transparent bg-white px-3 py-2 text-black" />
            </div>
            {sent && <p role="status" className="mt-4 rounded bg-green-100 p-3 text-green-900">Thanks—we have received your message.</p>}
            <button type="submit" disabled={submit.isPending} className="mt-5 w-full rounded bg-[#2F25C9] py-2 text-center text-white disabled:cursor-wait disabled:opacity-70">
                {submit.isPending ? 'Sending…' : 'Send'}
            </button>
        </form>
    )
}

export default ContactForm
