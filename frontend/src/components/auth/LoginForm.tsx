'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import {
  AuthHeading, EyeOpen, EyeOff,
  FieldError, Label, SubmitButton, inputCls,
} from '@/components/auth/AuthUI'

export function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const setAuth      = useAuthStore((s) => s.setAuth)

  // ── State: UI Controls ─────────────────────────────────────────────────────
  const [showPw, setShowPw] = useState(false)

  /**
   * Lifecycle: Monitor URL parameters for cross-flow notifications.
   * Handles success banners for verified emails or completed password resets.
   */
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified! You can now sign in.')
    }
    if (searchParams.get('reset') === 'true') {
      toast.success('Password updated! Please sign in.')
    }
  }, [searchParams])

  // ── Form Configuration (React Hook Form + Zod) ──────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ 
    resolver: zodResolver(loginSchema),
    mode: 'onTouched'
  })

  // ── Handlers: Authentication ───────────────────────────────────────────────

  /**
   * Processes the login request.
   * On success: Updates global auth store and redirects to dashboard.
   * On failure: Displays a clear error message via toast.
   */
  async function onSubmit(data: LoginSchema) {
    try {
      const response = await authApi.login(data)
      setAuth(response)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Section */}
      <AuthHeading
        title="Welcome back"
        subtitle={
          <>
            No account yet?{' '}
            <Link href="/auth/register" className="text-[var(--color-accent)] hover:text-[var(--color-green-light)] transition-colors font-semibold">
              Create one free
            </Link>
          </>
        }
      />

      <form method="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <Label>Email address</Label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className={inputCls(!!errors.email)}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label !mb-0">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-[0.72rem] text-[var(--color-accent)] hover:text-[var(--color-green-light)] transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="Your password"
              autoComplete="current-password"
              className={`${inputCls(!!errors.password)} pr-11`}
            />
            {/* Toggle Visibility */}
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--color-fg-3)] hover:text-[var(--color-green-light)] transition-colors rounded-lg z-10"
              tabIndex={-1}
            >
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        {/* Form Actions */}
        <div className="pt-1">
          <SubmitButton isSubmitting={isSubmitting} label="Sign in" loadingLabel="Signing in…" />
        </div>
      </form>

      {/* Footer Legal & Privacy */}
      <p className="text-center text-[0.72rem] text-[var(--color-fg-4)]">
        By signing in you agree to our{' '}
        <a href="#" className="text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] underline underline-offset-2">Terms</a>
        {' '}and{' '}
        <a href="#" className="text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] underline underline-offset-2">Privacy Policy</a>.
      </p>
    </div>
  )
}
