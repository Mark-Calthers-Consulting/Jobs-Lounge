import AuthRecoveryShell from '@/components/AuthRecoveryShell'
import ForgotPasswordForm from '@/components/ForgotPasswordForm'

const ForgotPasswordPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ area?: string | string[] }>
}) => {
    const requestedArea = (await searchParams).area
    const area = requestedArea === 'admin' ? 'admin' : 'candidate'
    const loginHref = area === 'admin' ? '/admin-center/login' : '/auth'

    return (
        <AuthRecoveryShell loginHref={loginHref}>
            <ForgotPasswordForm />
        </AuthRecoveryShell>
    )
}

export default ForgotPasswordPage
