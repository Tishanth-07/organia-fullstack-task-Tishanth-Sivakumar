import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login | Nintro',
  description: 'Sign in to your Nintro account to manage your tasks.',
}

/**
 * Login Page
 * Serves as the primary entry point for user authentication.
 * Wraps the LoginForm in a Suspense boundary to handle potential search param lookups.
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}