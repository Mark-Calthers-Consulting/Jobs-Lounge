'use client'

import {
    useCancelStaffInvitation,
    useCreateStaffMember,
    useGetTeamMembers,
    useResendStaffInvitation,
    useUpdateStaffRole,
    useUpdateStaffSuspension,
} from '@/hooks/useAdmin'
import { useUser } from '@/hooks/useUsers'
import type { CreateStaffPayload, StaffMember } from '@/types/types'
import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiLock, FiPlus, FiUnlock, FiX } from 'react-icons/fi'
import { toast } from 'sonner'

import PaginationControls from './PaginationControls'
import Modal from './Modal'
import { usePlatformSettings } from './PlatformSettingsProvider'
import { formatDateInTimeZone } from '@/utils/dateTime'

const roleLabel = (role: StaffMember['role']) => {
    if (role === 'super-admin') return 'Super administrator'
    if (role === 'recruiter') return 'Recruiter'
    return 'Administrator'
}

const lastLoginLabel = (
    member: StaffMember,
    timeZone: string,
) => {
    if (member.setupStatus === 'invited') return 'Not signed in yet'
    if (!member.lastLoginAt) return 'Never signed in'
    return formatDateInTimeZone(member.lastLoginAt, timeZone, {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

const emptyForm: CreateStaffPayload & { confirmPassword: string } = {
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    role: 'admin',
    setupMode: 'invitation',
    password: '',
    confirmPassword: '',
}

const TeamPageTable = () => {
    const { timeZone } = usePlatformSettings()
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [role, setRole] = useState<'' | StaffMember['role']>('')
    const [setupStatus, setSetupStatus] = useState<'' | StaffMember['setupStatus']>('')
    const [showForm, setShowForm] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [formError, setFormError] = useState<string | null>(null)
    const [pendingRole, setPendingRole] = useState<{
        member: StaffMember
        role: 'admin' | 'recruiter'
    } | null>(null)
    const [pendingCancellation, setPendingCancellation] = useState<StaffMember | null>(null)
    const [pendingSuspension, setPendingSuspension] = useState<{
        member: StaffMember
        suspended: boolean
    } | null>(null)
    const { data: currentUser } = useUser()
    const createMutation = useCreateStaffMember()
    const roleMutation = useUpdateStaffRole()
    const resendMutation = useResendStaffInvitation()
    const cancelInvitationMutation = useCancelStaffInvitation()
    const suspensionMutation = useUpdateStaffSuspension()

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput.trim())
            setPage(1)
        }, 300)
        return () => window.clearTimeout(timeout)
    }, [searchInput])

    const { data: members, isLoading, isError, refetch } = useGetTeamMembers({
        page,
        limit: 20,
        search,
        role,
        setupStatus,
    })

    const updateForm = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
        setForm((current) => ({ ...current, [field]: value }))
        setFormError(null)
    }

    const submitStaff = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError(null)
        if (form.setupMode === 'password') {
            if ((form.password || '').length < 8) {
                setFormError('Password must contain at least 8 characters.')
                return
            }
            if (new TextEncoder().encode(form.password || '').length > 72) {
                setFormError('Password must not exceed 72 UTF-8 bytes.')
                return
            }
            if (form.password !== form.confirmPassword) {
                setFormError('The passwords do not match.')
                return
            }
        }

        try {
            await createMutation.mutateAsync({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                telephone: form.telephone.trim(),
                role: form.role,
                setupMode: form.setupMode,
                ...(form.setupMode === 'password' ? { password: form.password } : {}),
            })
            toast.success(form.setupMode === 'invitation'
                ? 'Staff invitation queued.'
                : 'Staff account created.')
            setForm(emptyForm)
            setShowForm(false)
            setPage(1)
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Unable to create staff account.')
        }
    }

    const confirmRoleChange = async () => {
        if (!pendingRole) return
        try {
            await roleMutation.mutateAsync({
                userId: pendingRole.member._id,
                role: pendingRole.role,
            })
            toast.success(`${pendingRole.member.name} is now ${roleLabel(pendingRole.role)}.`)
            setPendingRole(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update staff role.')
        }
    }

    const resend = async (member: StaffMember) => {
        try {
            await resendMutation.mutateAsync(member._id)
            toast.success(`A new invitation was queued for ${member.name}.`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to resend invitation.')
        }
    }

    const confirmInvitationCancellation = async () => {
        if (!pendingCancellation) return
        try {
            await cancelInvitationMutation.mutateAsync(pendingCancellation._id)
            toast.success('Invitation cancelled and pending account removed.')
            setPendingCancellation(null)
            if (page > 1 && members?.data.length === 1) {
                setPage((current) => Math.max(1, current - 1))
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to cancel staff invitation.')
        }
    }

    const confirmSuspensionChange = async () => {
        if (!pendingSuspension) return
        try {
            await suspensionMutation.mutateAsync({
                userId: pendingSuspension.member._id,
                suspended: pendingSuspension.suspended,
            })
            toast.success(pendingSuspension.suspended
                ? `${pendingSuspension.member.name} has been suspended and signed out.`
                : `${pendingSuspension.member.name} can sign in again.`)
            setPendingSuspension(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update staff access.')
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(16rem,1fr)_12rem_12rem]">
                    <label className="sr-only" htmlFor="team-search">Search team members</label>
                    <input
                        id="team-search"
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search name or email…"
                        className="rounded-md border border-gray-300 px-3 py-2.5"
                    />
                    <label className="sr-only" htmlFor="team-role-filter">Filter by role</label>
                    <select
                        id="team-role-filter"
                        value={role}
                        onChange={(event) => {
                            setRole(event.target.value as typeof role)
                            setPage(1)
                        }}
                        className="rounded-md border border-gray-300 px-3 py-2.5"
                    >
                        <option value="">All roles</option>
                        <option value="admin">Administrators</option>
                        <option value="recruiter">Recruiters</option>
                        <option value="super-admin">Super administrators</option>
                    </select>
                    <label className="sr-only" htmlFor="team-status-filter">Filter by setup status</label>
                    <select
                        id="team-status-filter"
                        value={setupStatus}
                        onChange={(event) => {
                            setSetupStatus(event.target.value as typeof setupStatus)
                            setPage(1)
                        }}
                        className="rounded-md border border-gray-300 px-3 py-2.5"
                    >
                        <option value="">All account states</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="invited">Invitation pending</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm((current) => !current)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#003B6D] px-4 font-semibold text-white"
                    aria-expanded={showForm}
                    aria-controls="create-staff-panel"
                >
                    {showForm ? <FiX aria-hidden="true" /> : <FiPlus aria-hidden="true" />}
                    {showForm ? 'Close' : 'Add staff'}
                </button>
            </div>

            {showForm ? (
                <section id="create-staff-panel" className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm" aria-labelledby="create-staff-title">
                    <h2 id="create-staff-title" className="text-lg font-semibold">Create staff account</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Send a secure password-creation link or activate the account with a password you set.
                    </p>
                    <form onSubmit={submitStaff} className="mt-5 grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-gray-800">
                            First name
                            <input required maxLength={80} autoComplete="given-name" value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5" />
                        </label>
                        <label className="text-sm font-medium text-gray-800">
                            Last name
                            <input required maxLength={80} autoComplete="family-name" value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5" />
                        </label>
                        <label className="text-sm font-medium text-gray-800">
                            Email
                            <input required type="email" autoComplete="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5" />
                        </label>
                        <label className="text-sm font-medium text-gray-800">
                            Telephone
                            <input required type="tel" autoComplete="tel" value={form.telephone} onChange={(event) => updateForm('telephone', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5" />
                        </label>
                        <label className="text-sm font-medium text-gray-800">
                            Role
                            <select value={form.role} onChange={(event) => updateForm('role', event.target.value as 'admin' | 'recruiter')} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5">
                                <option value="admin">Administrator</option>
                                <option value="recruiter">Recruiter</option>
                            </select>
                        </label>

                        <fieldset className="md:col-span-2">
                            <legend className="text-sm font-medium text-gray-800">Password setup</legend>
                            <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                <label className={`rounded-md border p-4 ${form.setupMode === 'invitation' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="setupMode" value="invitation" checked={form.setupMode === 'invitation'} onChange={() => updateForm('setupMode', 'invitation')} />
                                    <span className="ml-2 font-semibold">Send password creation link</span>
                                    <span className="mt-1 block pl-6 text-sm text-gray-600">Recommended. The link expires after 48 hours.</span>
                                </label>
                                <label className={`rounded-md border p-4 ${form.setupMode === 'password' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="setupMode" value="password" checked={form.setupMode === 'password'} onChange={() => updateForm('setupMode', 'password')} />
                                    <span className="ml-2 font-semibold">Set password now</span>
                                    <span className="mt-1 block pl-6 text-sm text-gray-600">Share it with the staff member through a secure channel.</span>
                                </label>
                            </div>
                        </fieldset>

                        {form.setupMode === 'password' ? (
                            <>
                                <label className="text-sm font-medium text-gray-800">
                                    Password
                                    <span className="relative mt-1.5 block">
                                        <input required type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2.5 pr-11" />
                                        <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-gray-500">
                                            {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                                        </button>
                                    </span>
                                </label>
                                <label className="text-sm font-medium text-gray-800">
                                    Confirm password
                                    <input required type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => updateForm('confirmPassword', event.target.value)} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5" />
                                </label>
                            </>
                        ) : null}

                        {formError ? <p role="alert" className="text-sm text-red-700 md:col-span-2">{formError}</p> : null}
                        <div className="flex gap-3 md:col-span-2">
                            <button type="submit" disabled={createMutation.isPending} className="rounded-md bg-[#003B6D] px-4 py-2.5 font-semibold text-white disabled:opacity-60">
                                {createMutation.isPending
                                    ? 'Creating…'
                                    : form.setupMode === 'invitation'
                                        ? 'Create and send link'
                                        : 'Create account'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-4 py-2.5 font-semibold">Cancel</button>
                        </div>
                    </form>
                </section>
            ) : null}

            {pendingRole ? (
                <div role="alertdialog" aria-labelledby="role-change-title" className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <h2 id="role-change-title" className="font-semibold text-amber-950">Confirm role change</h2>
                    <p className="mt-1 text-sm text-amber-900">
                        Change {pendingRole.member.name} to {roleLabel(pendingRole.role)}? Their existing sessions will be signed out.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <button type="button" disabled={roleMutation.isPending} onClick={() => void confirmRoleChange()} className="rounded-md bg-amber-900 px-3 py-2 text-sm font-semibold text-white">
                            {roleMutation.isPending ? 'Updating…' : 'Confirm change'}
                        </button>
                        <button type="button" disabled={roleMutation.isPending} onClick={() => setPendingRole(null)} className="rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-950">Cancel</button>
                    </div>
                </div>
            ) : null}

            <Modal
                isOpen={Boolean(pendingCancellation)}
                onClose={() => setPendingCancellation(null)}
                onSubmit={() => void confirmInvitationCancellation()}
                title="Cancel this invitation?"
                actionLabel={cancelInvitationMutation.isPending ? 'Cancelling…' : 'Cancel invitation'}
                actionTone="danger"
                disabled={cancelInvitationMutation.isPending}
                size="compact"
                body={pendingCancellation ? (
                    <p className="text-sm leading-6 text-gray-200">
                        The pending account for {pendingCancellation.email} will be removed and its setup link will stop working. An email that has already been delivered cannot be recalled.
                    </p>
                ) : undefined}
                footer={(
                    <button type="button" disabled={cancelInvitationMutation.isPending} onClick={() => setPendingCancellation(null)} className="w-full rounded-md border border-gray-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">
                        Keep invitation
                    </button>
                )}
            />

            <Modal
                isOpen={Boolean(pendingSuspension)}
                onClose={() => setPendingSuspension(null)}
                onSubmit={() => void confirmSuspensionChange()}
                title={pendingSuspension?.suspended ? 'Suspend this account?' : 'Restore account access?'}
                actionLabel={suspensionMutation.isPending
                    ? 'Updating…'
                    : pendingSuspension?.suspended
                        ? 'Suspend account'
                        : 'Restore access'}
                actionTone={pendingSuspension?.suspended ? 'danger' : 'default'}
                disabled={suspensionMutation.isPending}
                size="compact"
                body={pendingSuspension ? (
                    <p className="text-sm leading-6 text-gray-200">
                        {pendingSuspension.suspended
                            ? `${pendingSuspension.member.name} will be signed out on every device and unable to sign in until you restore access. Their account and work will remain intact.`
                            : `${pendingSuspension.member.name} will be able to sign in again. Sessions created before the suspension will remain invalid.`}
                    </p>
                ) : undefined}
                footer={(
                    <button type="button" disabled={suspensionMutation.isPending} onClick={() => setPendingSuspension(null)} className="w-full rounded-md border border-gray-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">
                        Cancel
                    </button>
                )}
            />

            {isLoading ? <p role="status" className="p-4">Loading team members…</p> : null}
            {isError ? (
                <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
                    Unable to load team members.
                    <button type="button" onClick={() => void refetch()} className="ml-2 font-semibold underline">Try again</button>
                </div>
            ) : null}
            {!isLoading && !isError ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[1000px] border-collapse text-left">
                        <caption className="sr-only">Administration team members</caption>
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                {['Member', 'Role', 'Account state', 'Last login', 'Date joined', 'Actions'].map((header) => (
                                    <th scope="col" key={header} className="p-4 text-sm font-medium text-gray-600">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(members?.data ?? []).map((member) => {
                                const canChangeRole = member.role !== 'super-admin' && member._id !== currentUser?._id
                                return (
                                    <tr key={member._id} className="border-b border-gray-100 last:border-0">
                                        <td className="p-4">
                                            <span className="block font-semibold text-gray-900">{member.name}</span>
                                            <a className="text-sm text-blue-800 hover:underline" href={`mailto:${member.email}`}>{member.email}</a>
                                        </td>
                                        <td className="p-4">
                                            {canChangeRole ? (
                                                <select
                                                    aria-label={`Role for ${member.name}`}
                                                    value={member.role}
                                                    onChange={(event) => {
                                                        setPendingCancellation(null)
                                                        setPendingSuspension(null)
                                                        setPendingRole({
                                                            member,
                                                            role: event.target.value as 'admin' | 'recruiter',
                                                        })
                                                    }}
                                                    className="rounded-md border border-gray-300 px-3 py-2"
                                                >
                                                    <option value="admin">Administrator</option>
                                                    <option value="recruiter">Recruiter</option>
                                                </select>
                                            ) : roleLabel(member.role)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                member.setupStatus === 'active'
                                                    ? 'bg-green-50 text-green-800'
                                                    : member.setupStatus === 'suspended'
                                                        ? 'bg-red-50 text-red-800'
                                                        : 'bg-amber-50 text-amber-900'
                                            }`}>
                                                {member.setupStatus === 'active'
                                                    ? 'Active'
                                                    : member.setupStatus === 'suspended'
                                                        ? 'Suspended'
                                                        : 'Invitation pending'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {lastLoginLabel(member, timeZone)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{formatDateInTimeZone(member.createdAt, timeZone)}</td>
                                        <td className="p-4">
                                            {member.setupStatus === 'invited' ? (
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    <button type="button" disabled={resendMutation.isPending || cancelInvitationMutation.isPending} onClick={() => void resend(member)} className="text-sm font-semibold text-blue-800 hover:underline disabled:opacity-50">
                                                        Resend invitation
                                                    </button>
                                                    <button type="button" disabled={resendMutation.isPending || cancelInvitationMutation.isPending} onClick={() => {
                                                        setPendingRole(null)
                                                        setPendingCancellation(member)
                                                    }} className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50">
                                                        Cancel invitation
                                                    </button>
                                                </div>
                                            ) : member.role !== 'super-admin' && member._id !== currentUser?._id ? (
                                                <button
                                                    type="button"
                                                    disabled={suspensionMutation.isPending}
                                                    onClick={() => {
                                                        setPendingRole(null)
                                                        setPendingCancellation(null)
                                                        setPendingSuspension({
                                                            member,
                                                            suspended: member.setupStatus !== 'suspended',
                                                        })
                                                    }}
                                                    className={`inline-flex items-center gap-2 text-sm font-semibold hover:underline disabled:opacity-50 ${member.setupStatus === 'suspended' ? 'text-emerald-700' : 'text-red-700'}`}
                                                >
                                                    {member.setupStatus === 'suspended'
                                                        ? <FiUnlock aria-hidden="true" />
                                                        : <FiLock aria-hidden="true" />}
                                                    {member.setupStatus === 'suspended' ? 'Restore access' : 'Suspend access'}
                                                </button>
                                            ) : <span className="text-sm text-gray-400">—</span>}
                                        </td>
                                    </tr>
                                )
                            })}
                            {(members?.data.length ?? 0) === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No team members match these filters.</td></tr>
                            ) : null}
                        </tbody>
                    </table>
                    <PaginationControls pagination={members?.pagination} onPageChange={setPage} />
                </div>
            ) : null}
        </div>
    )
}

export default TeamPageTable
