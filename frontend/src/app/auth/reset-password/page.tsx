import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | Nintro',
  description: 'Securely reset your password and regain access to your account.',
}

/**
 * Reset Password Page
 * The final step of the password recovery workflow.
 * Wraps the ResetPasswordForm in a Suspense boundary for search param handling.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}