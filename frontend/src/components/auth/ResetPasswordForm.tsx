'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, ResetPasswordSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { EyeOpen, EyeOff, getPasswordStrength, PasswordStrengthBar } from './AuthUI'

export function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') || ''

  const [code, setCode]           = useState(['', '', '', '', '', ''])
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({ resolver: zodResolver(resetPasswordSchema) })

  const pwValue  = watch('newPassword', '')
  const strength = getPasswordStrength(pwValue)

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const updated = [...code]
    updated[index] = value.slice(-1)
    setCode(updated)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const updated = [...code]
    pasted.split('').forEach((d, i) => { updated[i] = d })
    setCode(updated)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  async function onSubmit(data: ResetPasswordSchema) {
    const fullCode = code.join('')
    if (fullCode.length < 6) { setServerError('Please enter the 6-digit code.'); return }
    setServerError('')
    try {
      await authApi.resetPassword({ email, code: fullCode, newPassword: data.newPassword })
      router.push('/auth/login?reset=true')
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Reset password</h2>
        <p className="text-[#6b7280]">
          Enter the 6-digit code sent to{' '}
          <span className="text-[#9ca3af] font-medium">{email || 'your email'}</span>{' '}
          and choose a new password.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#d1d5db]">6-digit reset code</label>
          <div className="flex gap-3" onPaste={handlePaste}>
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
                className="w-12 h-14 text-center text-xl font-bold bg-[#111827] border-2 rounded-xl text-white outline-none transition-all focus:border-[#16a34a] border-[#1f2937] caret-[#4ade80]"
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#d1d5db]">New password</label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 chars, uppercase, number, symbol"
              autoComplete="new-password"
              className={`w-full bg-[#111827] border rounded-xl px-4 py-3 pr-11 text-white placeholder-[#4b5563] text-sm outline-none transition-colors focus:border-[#16a34a] ${errors.newPassword ? 'border-red-500/60' : 'border-[#1f2937]'}`}
            />
            <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af] transition-colors">
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {pwValue && <PasswordStrengthBar {...strength} />}
          {errors.newPassword && <p className="text-red-400 text-xs">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#d1d5db]">Confirm new password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
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
          {isSubmitting
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Resetting…</>
            : 'Reset password'}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-[#6b7280] text-sm">Didn't get a code?</p>
        <Link href="/auth/forgot-password" className="text-[#4ade80] hover:text-[#86efac] text-sm font-medium transition-colors">
          Request a new code
        </Link>
      </div>
    </div>
  )
}
