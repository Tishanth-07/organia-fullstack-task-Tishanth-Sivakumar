'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, ResetPasswordSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  AuthHeading, EyeOpen, EyeOff,
  Label, PasswordStrengthBar, SubmitButton, getPasswordStrength, inputCls,
  FieldError,
} from '@/components/auth/AuthUI'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  // ── State: UI Controls ─────────────────────────────────────────────────────
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown]       = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // ── Form Configuration (React Hook Form + Zod) ──────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({ 
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched'
  })

  // Real-time strength meter for the new password
  const pwValue  = watch('newPassword', '')
  const strength = getPasswordStrength(pwValue)

  // ── Handlers: Submission ───────────────────────────────────────────────────

  /**
   * Processes the password reset request.
   * On success: Redirects to login with a 'reset=true' flag to trigger a notification.
   */
  async function onSubmit(data: ResetPasswordSchema) {
    try {
      await authApi.resetPassword({
        email:    email,
        code:     data.code,
        newPassword: data.newPassword,
      })
      toast.success('Password reset successfully!')
      router.push('/auth/login?reset=true')
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.')
    }
  }

  /**
   * Requests a new reset code.
   */
  async function handleResend() {
    setResendLoading(true)
    try {
      await authApi.forgotPassword({ email })
      toast.success('A new reset code has been sent.')
      setCooldown(60)
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code.')
    } finally {
      setResendLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Section */}
      <AuthHeading
        icon={
          <svg className="w-6 h-6 text-[var(--color-green-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        }
        title="Reset your password"
        subtitle={
          <>
            Almost there! Enter the 6-digit code sent to{' '}
            <span className="text-[var(--color-fg-2)] font-medium">{email || 'your email'}</span>.
          </>
        }
      />

      <form method="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Code Field */}
        <div>
          <Label>Reset code</Label>
          <input
            {...register('code')}
            placeholder="6-digit code"
            maxLength={6}
            className={inputCls(!!errors.code)}
          />
          <FieldError message={errors.code?.message} />
        </div>

        {/* New Password Field */}
        <div>
          <Label>New password</Label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 chars, uppercase, number, symbol"
              autoComplete="new-password"
              className={`${inputCls(!!errors.newPassword)} pr-11`}
            />
            <button type="button" onClick={() => setShowPw((p) => !p)} tabIndex={-1}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--color-fg-3)] hover:text-[var(--color-green-light)] transition-colors rounded-lg z-10">
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {/* Strength Meter */}
          {pwValue && <PasswordStrengthBar score={strength.score} color={strength.color} label={strength.label} />}
          <FieldError message={errors.newPassword?.message} />
        </div>

        <div>
          <Label>Confirm new password</Label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              className={`${inputCls(!!errors.confirmPassword)} pr-11`}
            />
            <button type="button" onClick={() => setShowConfirm((p) => !p)} tabIndex={-1}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--color-fg-3)] hover:text-[var(--color-green-light)] transition-colors rounded-lg z-10">
              {showConfirm ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {/* Form Actions */}
        <div className="pt-1">
          <SubmitButton isSubmitting={isSubmitting} label="Reset password" loadingLabel="Resetting…" />
        </div>
      </form>

      {/* Resend Actions */}
      <div className="text-center space-y-1.5">
        <p className="text-[var(--color-fg-3)] text-[0.8rem]">Didn't receive a code?</p>
        {cooldown > 0 ? (
          <p className="text-[var(--color-fg-3)] text-[0.8rem]">
            Resend in <span className="text-[var(--color-green-light)] font-mono font-bold">{cooldown}s</span>
          </p>
        ) : (
          <button type="button" onClick={handleResend} disabled={resendLoading}
            className="text-[var(--color-accent)] hover:text-[var(--color-green-light)] text-[0.8rem] font-semibold transition-colors disabled:opacity-50">
            {resendLoading ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link href="/auth/login" className="text-[0.78rem] text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}