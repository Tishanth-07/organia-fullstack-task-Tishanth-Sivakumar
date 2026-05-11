import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | Nintro',
  description: 'Recover your Nintro account access by resetting your password.',
}

/**
 * Forgot Password Page
 * Initiates the multi-step password recovery workflow.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}