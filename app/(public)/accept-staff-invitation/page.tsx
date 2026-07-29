import AcceptStaffInvitationForm from '@/components/AcceptStaffInvitationForm'
import AuthRecoveryShell from '@/components/AuthRecoveryShell'

const AcceptStaffInvitationPage = () => (
    <AuthRecoveryShell loginHref="/admin-center/login">
        <AcceptStaffInvitationForm />
    </AuthRecoveryShell>
)

export default AcceptStaffInvitationPage
