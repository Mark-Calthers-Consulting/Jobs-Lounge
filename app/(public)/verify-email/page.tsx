import AuthRecoveryShell from '@/components/AuthRecoveryShell'
import VerifyEmailForm from '@/components/VerifyEmailForm'

const VerifyEmailPage = () => (
    <AuthRecoveryShell loginHref="/auth">
        <VerifyEmailForm />
    </AuthRecoveryShell>
)

export default VerifyEmailPage
