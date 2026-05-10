'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'

export function ForgotPasswordForm() {
  const router = useRouter()
  const [serverError, setServerError]   = useState('')
  const [successMessage, setSuccess]    = useState('')
  const [emailSent, setEmailSent]       = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordSchema) {
    setServerError('')
    try {
      const res = await authApi.forgotPassword(data)
      setSubmittedEmail(data.email)
      setSuccess(res.message)
      setEmailSent(true)
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Forgot password?</h2>
        <p className="text-[#6b7280]">
          Enter your email and we'll send a reset code if the account exists.
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

      {emailSent ? (
        /* Success state — prompt to go to reset page */
        <div className="space-y-6">
          <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
          <button
            onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(submittedEmail)}`)}
            className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Enter reset code →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending…</>
              : 'Send reset code'}
          </button>
        </form>
      )}

      <div className="text-center">
        <Link href="/auth/login" className="text-[#4b5563] hover:text-[#6b7280] text-sm transition-colors">
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
