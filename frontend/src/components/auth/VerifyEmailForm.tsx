'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'

export function VerifyEmailForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') || ''

  const [code, setCode]             = useState(['', '', '', '', '', ''])
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown]     = useState(0) // seconds remaining

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Handle OTP digit input
  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return // digits only
    const updated = [...code]
    updated[index] = value.slice(-1) // one digit per box
    setCode(updated)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
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

  async function handleVerify() {
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Please enter all 6 digits.'); return }
    setError(''); setSuccess(''); setLoading(true)
    try {
      await authApi.verifyEmail({ email, code: fullCode })
      setSuccess('Email verified! Redirecting to login…')
      setTimeout(() => router.push('/auth/login?verified=true'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(''); setResendLoading(true)
    try {
      await authApi.resendVerification({ email })
      setSuccess('A new code has been sent to your email.')
      setCooldown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Check your email</h2>
        <p className="text-[#6b7280]">
          We sent a 6-digit code to <span className="text-[#9ca3af] font-medium">{email || 'your email'}</span>.
          <br />It expires in <span className="text-[#4ade80]">2 minutes</span>.
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* 6-digit OTP boxes */}
      <div className="space-y-4">
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-[#111827] border-2 rounded-xl text-white outline-none transition-all focus:border-[#16a34a] focus:bg-[#0f1f0f] border-[#1f2937] caret-[#4ade80]"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || code.join('').length < 6}
          className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {loading
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying…</>
            : 'Verify email'}
        </button>
      </div>

      {/* Resend */}
      <div className="text-center space-y-2">
        <p className="text-[#6b7280] text-sm">Didn't receive a code?</p>
        {cooldown > 0 ? (
          <p className="text-[#4b5563] text-sm">Resend in <span className="text-[#4ade80] font-mono">{cooldown}s</span></p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-[#4ade80] hover:text-[#86efac] text-sm font-medium transition-colors disabled:opacity-50"
          >
            {resendLoading ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>

      <div className="text-center">
        <Link href="/auth/register" className="text-[#4b5563] hover:text-[#6b7280] text-sm transition-colors">
          ← Back to register
        </Link>
      </div>
    </div>
  )
}
