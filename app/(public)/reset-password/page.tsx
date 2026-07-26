import AuthRecoveryShell from '@/components/AuthRecoveryShell'
import ResetPasswordForm from '@/components/ResetPasswordForm'

const ResetPasswordPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ area?: string | string[] }>
}) => {
    const requestedArea = (await searchParams).area
    const area = requestedArea === 'admin' ? 'admin' : 'candidate'
    const loginHref = area === 'admin' ? '/admin-center/login' : '/auth'

    return (
        <AuthRecoveryShell loginHref={loginHref}>
            <ResetPasswordForm area={area} />
        </AuthRecoveryShell>
    )
}

export default ResetPasswordPage
