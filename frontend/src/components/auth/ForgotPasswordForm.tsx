'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { AuthHeading, FieldError, Label, SubmitButton, inputCls } from '@/components/auth/AuthUI'

export function ForgotPasswordForm() {
  const router = useRouter()
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordSchema) {
    try {
      const res = await authApi.forgotPassword(data)
      setSubmittedEmail(data.email)
      toast.success(res.message || 'Code sent! Check your inbox.')
      setSent(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset code.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <AuthHeading
        icon={
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        }
        iconBg="rgba(251,191,36,0.1)"
        title="Forgot password?"
        subtitle="Enter your email and we'll send a 6-digit reset code if an account exists."
      />

      {sent ? (
        <div className="space-y-5">
          <p className="text-sm text-[var(--color-fg-3)] bg-[var(--color-accent-dim)] p-4 rounded-xl border border-[var(--color-accent)]/10">
            We've sent a code to <span className="text-[var(--color-fg-2)] font-medium">{submittedEmail}</span>.
          </p>
          <button
            onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(submittedEmail)}`)}
            className="btn-primary"
          >
            Enter reset code →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <div className="pt-1">
            <SubmitButton isSubmitting={isSubmitting} label="Send reset code" loadingLabel="Sending…" />
          </div>
        </form>
      )}

      <div className="text-center">
        <Link href="/auth/login" className="text-[0.78rem] text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}