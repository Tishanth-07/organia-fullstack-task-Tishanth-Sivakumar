'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, ResetPasswordSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  AuthHeading, EyeOpen, EyeOff, FieldError, Label,
  PasswordStrengthBar, SubmitButton, getPasswordStrength, inputCls,
} from '@/components/auth/AuthUI'

export function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') || ''

  const [code, setCode]              = useState(['', '', '', '', '', ''])
  const [showPw, setShowPw]          = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' }
  })

  const pwValue  = watch('newPassword', '')
  const strength = getPasswordStrength(pwValue)

  function handleCodeChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const updated = [...code]
    updated[i] = val.slice(-1)
    setCode(updated)
    
    // Sync with react-hook-form
    const fullCode = updated.join('')
    setValue('code', fullCode, { shouldValidate: true })

    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  function handleCodeKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const updated = [...code]
    pasted.split('').forEach((d, i) => { updated[i] = d })
    setCode(updated)
    
    // Sync with react-hook-form
    setValue('code', updated.join(''), { shouldValidate: true })

    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  async function onSubmit(data: ResetPasswordSchema) {
    if (!email) {
      toast.error('Session expired. Please request a new code.')
      return
    }

    try {
      await authApi.resetPassword({ email, code: data.code, newPassword: data.newPassword })
      toast.success('Password reset successfully! Redirecting...')
      setTimeout(() => router.push('/auth/login?reset=true'), 1200)
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. Please try again.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <AuthHeading
        icon={
          <svg className="w-6 h-6 text-[var(--color-green-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        }
        title="Reset password"
        subtitle={
          <>
            Enter the code sent to{' '}
            <span className="text-[var(--color-fg-2)] font-medium">{email || 'your email'}</span>
            {' '}and choose a new password.
          </>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* OTP */}
        <div onPaste={handlePaste}>
          <label className="field-label">6-digit reset code</label>
          <div className="flex gap-2.5 mt-1.5">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                className={`otp-box ${digit ? 'filled' : ''}`}
              />
            ))}
          </div>
          <FieldError message={errors.code?.message} />
        </div>

        {/* New password */}
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
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--color-fg-3)] hover:text-[var(--color-green-light)] transition-colors rounded-lg">
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {pwValue && <PasswordStrengthBar score={strength.score} color={strength.color} label={strength.label} />}
          <FieldError message={errors.newPassword?.message} />
        </div>

        {/* Confirm password */}
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
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--color-fg-3)] hover:text-[var(--color-green-light)] transition-colors rounded-lg">
              {showConfirm ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <div className="pt-1">
          <SubmitButton isSubmitting={isSubmitting} label="Reset password" loadingLabel="Resetting…" />
        </div>
      </form>

      <div className="text-center space-y-2">
        <p className="text-[0.78rem] text-[var(--color-fg-3)]">Didn't get a code?</p>
        <Link href="/auth/forgot-password"
          className="text-[0.78rem] text-[var(--color-accent)] hover:text-[var(--color-green-light)] font-semibold transition-colors">
          Request a new code
        </Link>
      </div>
    </div>
  )
}