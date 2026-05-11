import { Suspense } from 'react'
import type { Metadata } from 'next'
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm'

export const metadata: Metadata = {
  title: 'Verify Email | Nintro',
  description: 'Complete your registration by verifying your email address.',
}

/**
 * Email Verification Page
 * The critical activation step for new user accounts.
 * Wraps the VerifyEmailForm in a Suspense boundary for search param handling.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  )
}