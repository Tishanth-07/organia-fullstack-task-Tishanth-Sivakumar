'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '@/schemas/authSchemas'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { EyeOpen, EyeOff } from './AuthUI'

export function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const setAuth      = useAuthStore((s) => s.setAuth)

  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [successBanner, setSuccessBanner] = useState('')

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessBanner('Email verified! You can now log in.')
    }
    if (searchParams.get('reset') === 'true') {
      setSuccessBanner('Password reset! You can now log in.')
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginSchema) {
    setServerError('')
    try {
      const response = await authApi.login(data)
      setAuth(response)
      router.push('/dashboard')
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Welcome back</h2>
        <p className="text-[#6b7280]">
          No account?{' '}
          <Link href="/auth/register" className="text-[#4ade80] hover:text-[#86efac] transition-colors font-medium">
            Create one free
          </Link>
        </p>
      </div>

      {successBanner && (
        <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-green-400 text-sm">{successBanner}</p>
        </div>
      )}

      {serverError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{serverError}</p>
        </div>
      )}

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#d1d5db]">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-[#4ade80] hover:text-[#86efac] transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="Your password"
              autoComplete="current-password"
              className={`w-full bg-[#111827] border rounded-xl px-4 py-3 pr-11 text-white placeholder-[#4b5563] text-sm outline-none transition-colors focus:border-[#16a34a] ${errors.password ? 'border-red-500/60' : 'border-[#1f2937]'}`}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af] transition-colors"
            >
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in…</>
            : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
