'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  AuthHeading, EyeOpen, EyeOff,
  Label, PasswordStrengthBar, SubmitButton, getPasswordStrength, inputCls,
  FieldError,
} from '@/components/auth/AuthUI'

export function RegisterForm() {
  const router = useRouter()

  // ── State: UI Controls ─────────────────────────────────────────────────────
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── Form Configuration (React Hook Form + Zod) ──────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({ 
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  })

  // Watch password field to update strength meter in real-time
  const pwValue  = watch('password', '')
  const strength = getPasswordStrength(pwValue)

  // ── Handlers: Registration ─────────────────────────────────────────────────

  /**
   * Processes account creation request.
   * On success: Redirects to the verify-email page with user context.
   */
  async function onSubmit(data: RegisterSchema) {
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        password:  data.password,
      })
      toast.success('Account created! Please verify your email.')
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Section */}
      <AuthHeading
        title="Create your account"
        subtitle={
          <>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--color-accent)] hover:text-[var(--color-green-light)] transition-colors font-semibold">
              Sign in
            </Link>
          </>
        }
      />

      <form method="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First name</Label>
            <input
              {...register('firstName')}
              placeholder="Jane"
              className={inputCls(!!errors.firstName)}
            />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label>Last name</Label>
            <input
              {...register('lastName')}
              placeholder="Doe"
              className={inputCls(!!errors.lastName)}
            />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        {/* Identity Section */}
        <div>
          <Label>Work email</Label>
          <input
            {...register('email')}
            type="email"
            placeholder="jane@company.com"
            autoComplete="email"
            className={inputCls(!!errors.email)}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Security Section */}
        <div>
          <Label>Password</Label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 chars, uppercase, number, symbol"
              autoComplete="new-password"
              className={`${inputCls(!!errors.password)} pr-11`}
            />
            <button type="button" onClick={() => setShowPw((p) => !p)} tabIndex={-1}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--color-fg-3)] hover:text-[var(--color-green-light)] transition-colors rounded-lg z-10">
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {/* Password Strength Feedback */}
          {pwValue && <PasswordStrengthBar score={strength.score} color={strength.color} label={strength.label} />}
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <Label>Confirm password</Label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter password"
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
          <SubmitButton isSubmitting={isSubmitting} label="Create account" loadingLabel="Creating account…" />
        </div>
      </form>

      {/* Legal Disclaimer */}
      <p className="text-center text-[0.72rem] text-[var(--color-fg-4)]">
        By creating an account you agree to our{' '}
        <a href="#" className="text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] underline underline-offset-2">Terms</a>
        {' '}and{' '}
        <a href="#" className="text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] underline underline-offset-2">Privacy Policy</a>.
      </p>
    </div>
  )
}