import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account | Nintro',
  description: 'Join Nintro to start organizing your tasks and boosting your productivity.',
}

/**
 * Registration Page
 * The entry point for new users to provision their Nintro account.
 */
export default function RegisterPage() {
  return <RegisterForm />
}