'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { EyeOpen, EyeOff, getPasswordStrength, PasswordStrengthBar } from './AuthUI'

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) })

  const pwValue = watch('password', '')
  const strength = getPasswordStrength(pwValue)

  async function onSubmit(data: RegisterSchema) {
    setServerError('')
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        password:  data.password,
      })
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Create account</h2>
        <p className="text-[#6b7280]">
          Already have one?{' '}
          <Link href="/auth/login" className="text-[#4ade80] hover:text-[#86efac] transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#d1d5db]">First name</label>
            <input
              {...register('firstName')}
              placeholder="Jane"
              className={`w-full bg-[#111827] border rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none transition-colors focus:border-[#16a34a] ${errors.firstName ? 'border-red-500/60' : 'border-[#1f2937]'}`}
            />
            {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#d1d5db]">Last name</label>
            <input
              {...register('lastName')}
              placeholder="Doe"
              className={`w-full bg-[#111827] border rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none transition-colors focus:border-[#16a34a] ${errors.lastName ? 'border-red-500/60' : 'border-[#1f2937]'}`}
            />
            {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#d1d5db]">Email address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            className={`w-full bg-[#111827] border rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none transition-colors focus:border-[#16a34a] ${errors.email ? 'border-red-500/60' : 'border-[#1f2937]'}`}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#d1d5db]">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 chars, uppercase, number, symbol"
              autoComplete="new-password"
              className={`w-full bg-[#111827] border rounded-xl px-4 py-3 pr-11 text-white placeholder-[#4b5563] text-sm outline-none transition-colors focus:border-[#16a34a] ${errors.password ? 'border-red-500/60' : 'border-[#1f2937]'}`}
            />
            <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af] transition-colors">
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {pwValue && <PasswordStrengthBar {...strength} />}
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#d1d5db]">Confirm password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className={`w-full bg-[#111827] border rounded-xl px-4 py-3 pr-11 text-white placeholder-[#4b5563] text-sm outline-none transition-colors focus:border-[#16a34a] ${errors.confirmPassword ? 'border-red-500/60' : 'border-[#1f2937]'}`}
            />
            <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af] transition-colors">
              {showConfirm ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
          ) : 'Create account'}
        </button>
      </form>
    </div>
  )
}
