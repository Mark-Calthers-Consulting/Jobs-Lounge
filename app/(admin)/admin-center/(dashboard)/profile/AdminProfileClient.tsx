'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiCheckCircle, FiLock } from 'react-icons/fi'
import { toast } from 'sonner'

import {
    staffProfileSchema,
    type StaffProfileInput,
    type StaffProfileValues,
} from '@/schemas/staffSettingsSchema'
import { useUpdateStaffProfile, useUser } from '@/hooks/useUsers'

const inputClass = 'mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 focus:border-[#184aa2] focus:outline-none'

const roleLabel = (role?: string) => {
    if (role === 'super-admin') return 'Super administrator'
    if (role === 'recruiter') return 'Recruiter'
    return 'Administrator'
}

const AdminProfileClient = () => {
    const userQuery = useUser()
    const update = useUpdateStaffProfile()
    const [serverError, setServerError] = useState<string | null>(null)
    const form = useForm<StaffProfileInput, unknown, StaffProfileValues>({
        resolver: zodResolver(staffProfileSchema),
        defaultValues: { firstName: '', lastName: '', telephone: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        if (!userQuery.data) return
        form.reset({
            firstName: userQuery.data.firstName || '',
            lastName: userQuery.data.lastName || '',
            telephone: userQuery.data.telephone || '',
        })
    }, [form, userQuery.data])

    const submit = form.handleSubmit(async (values) => {
        setServerError(null)
        try {
            const user = await update.mutateAsync(values)
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                telephone: user.telephone || '',
            })
            toast.success('Profile updated')
        } catch (error) {
            setServerError(error instanceof Error ? error.message : 'Unable to update profile.')
        }
    })

    if (userQuery.isLoading) return <p role="status">Loading profile…</p>
    if (userQuery.isError || !userQuery.data) {
        return <p role="alert" className="text-red-700">Unable to load your staff profile.</p>
    }
    const user = userQuery.data

    return (
        <div className="mx-auto max-w-4xl">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-950">My Profile</h1>
                <p className="mt-2 text-gray-600">Keep your staff identity and contact number current.</p>
            </header>

            <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="staff-profile-heading">
                    <h2 id="staff-profile-heading" className="text-lg font-semibold text-gray-950">Personal details</h2>
                    {!user.firstName || !user.lastName ? (
                        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                            This legacy account only has a combined display name. Enter separate first and last names before saving.
                        </p>
                    ) : null}
                    <form onSubmit={submit} noValidate aria-busy={update.isPending} className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="staff-first-name" className="text-sm font-medium text-gray-800">First name</label>
                            <input id="staff-first-name" autoComplete="given-name" aria-invalid={Boolean(form.formState.errors.firstName)} className={inputClass} {...form.register('firstName')} />
                            {form.formState.errors.firstName ? <p className="mt-1 text-sm text-red-700">{form.formState.errors.firstName.message}</p> : null}
                        </div>
                        <div>
                            <label htmlFor="staff-last-name" className="text-sm font-medium text-gray-800">Last name</label>
                            <input id="staff-last-name" autoComplete="family-name" aria-invalid={Boolean(form.formState.errors.lastName)} className={inputClass} {...form.register('lastName')} />
                            {form.formState.errors.lastName ? <p className="mt-1 text-sm text-red-700">{form.formState.errors.lastName.message}</p> : null}
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="staff-telephone" className="text-sm font-medium text-gray-800">Telephone</label>
                            <input id="staff-telephone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.telephone)} className={inputClass} {...form.register('telephone')} />
                            {form.formState.errors.telephone ? <p className="mt-1 text-sm text-red-700">{form.formState.errors.telephone.message}</p> : null}
                        </div>
                        {serverError ? <p role="alert" className="text-sm text-red-700 sm:col-span-2">{serverError}</p> : null}
                        <div className="sm:col-span-2">
                            <button type="submit" disabled={update.isPending || !form.formState.isDirty} className="rounded-md bg-[#003B6D] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55">
                                {update.isPending ? 'Saving…' : 'Save profile'}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <FiLock aria-hidden="true" className="text-[#184aa2]" />
                        Account-managed fields
                    </div>
                    <dl className="mt-4 space-y-4 text-sm">
                        <div>
                            <dt className="text-gray-500">Email</dt>
                            <dd className="mt-1 break-all font-medium text-gray-900">{user.email}</dd>
                            <span className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${user.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {user.emailVerified ? <FiCheckCircle aria-hidden="true" /> : null}
                                {user.emailVerified ? 'Verified' : 'Not verified'}
                            </span>
                        </div>
                        <div>
                            <dt className="text-gray-500">Role</dt>
                            <dd className="mt-1 font-medium text-gray-900">{roleLabel(user.role)}</dd>
                        </div>
                    </dl>
                    <p className="mt-5 text-xs leading-5 text-gray-500">Email addresses and roles are managed through secure account and Team workflows.</p>
                </aside>
            </div>
        </div>
    )
}

export default AdminProfileClient
