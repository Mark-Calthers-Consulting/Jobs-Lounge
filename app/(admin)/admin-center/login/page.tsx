import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Instrument_Sans } from "next/font/google"

import AdminAuthForm from "@/components/AdminAuthForm"
import GuestOnlyRoute from "@/components/GuestOnlyRoute"
import { safeNextPath } from "@/utils/authRouting"
import styles from "./AdminLogin.module.css"

const adminBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-admin-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Team sign in | Jobs Lounge",
  description: "Sign in to the Jobs Lounge team workspace.",
  robots: { index: false, follow: false },
}

const AdminLogin = async ({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[]
    passwordReset?: string | string[]
    invitation?: string | string[]
  }>
}) => {
  const query = await searchParams
  const nextPath = safeNextPath(query.next, 'admin')
  const passwordResetComplete = query.passwordReset === 'success'
  const invitationAccepted = query.invitation === 'accepted'

  return (
    <GuestOnlyRoute area="admin" nextPath={nextPath}>
      <main
        id="main-content"
        tabIndex={-1}
        className={`${styles.page} ${adminBody.variable}`}
      >
        <Image
          src="/admin-login-background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
        <div className={styles.scrim} aria-hidden="true" />

        <section className={styles.card} aria-label="Jobs Lounge staff sign in">
          <Link href="/" aria-label="Jobs Lounge home" className={styles.logoLink}>
            <Image src="/logo.svg" width={88} height={61} alt="Jobs Lounge" className={styles.logo} />
          </Link>

          <AdminAuthForm
            nextPath={nextPath}
            passwordResetComplete={passwordResetComplete}
            invitationAccepted={invitationAccepted}
          />
        </section>

        <p className={styles.accessNote}>
          Authorised team access only
        </p>
      </main>
    </GuestOnlyRoute>
  )
}

export default AdminLogin
