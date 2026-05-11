'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { AuthHeading, FieldError, Label, SubmitButton, inputCls } from '@/components/auth/AuthUI'

export function VerifyEmailForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') || ''

  const [code, setCode]               = useState(['', '', '', '', '', ''])
  const [loading, setLoading]         = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown]       = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  function handleChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const updated = [...code]; updated[i] = val.slice(-1); setCode(updated)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus()
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
    const full = code.join('')
    if (full.length < 6) {
      toast.error('Please enter all 6 digits.')
      return
    }
    setLoading(true)
    try {
      await authApi.verifyEmail({ email, code: full })
      toast.success('Email verified successfully!')
      setTimeout(() => router.push('/auth/login?verified=true'), 1200)
    } catch (err: any) {
      toast.error(err.message || 'Verification failed')
    } finally { setLoading(false) }
  }

  async function handleResend() {
    setResendLoading(true)
    try {
      await authApi.resendVerification({ email })
      toast.success('A new code has been sent.')
      setCooldown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code')
    } finally { setResendLoading(false) }
  }

  const filled = code.join('').length

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Icon + heading */}
      <div className="space-y-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <svg className="w-7 h-7 text-[var(--color-green-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-[1.85rem] font-black text-[var(--color-fg)] font-display tracking-tight">Check your email</h2>
        <p className="text-[var(--color-fg-3)] text-[0.85rem] leading-relaxed">
          We sent a 6-digit code to{' '}
          <span className="text-[var(--color-fg-2)] font-medium">{email || 'your email'}</span>.{' '}
          It expires in <span className="text-[var(--color-green-light)]">2 minutes</span>.
        </p>
      </div>

      {/* OTP boxes */}
      <div className="space-y-4" onPaste={handlePaste}>
        <label className="field-label">Verification code</label>
        <div className="flex gap-2.5">
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
              className={`otp-box ${digit ? 'filled' : ''}`}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i < filled ? 'var(--color-accent)' : 'var(--color-border-2)' }} />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || filled < 6}
          className="btn-primary"
        >
          {loading
            ? <><svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying…</>
            : 'Verify email'}
        </button>
      </div>

      {/* Resend */}
      <div className="text-center space-y-1.5">
        <p className="text-[var(--color-fg-3)] text-[0.8rem]">Didn't receive a code?</p>
        {cooldown > 0 ? (
          <p className="text-[var(--color-fg-3)] text-[0.8rem]">
            Resend in <span className="text-[var(--color-green-light)] font-mono font-bold">{cooldown}s</span>
          </p>
        ) : (
          <button onClick={handleResend} disabled={resendLoading}
            className="text-[var(--color-accent)] hover:text-[var(--color-green-light)] text-[0.8rem] font-semibold transition-colors disabled:opacity-50">
            {resendLoading ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>

      <div className="text-center">
        <Link href="/auth/register" className="text-[0.78rem] text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] transition-colors">
          ← Back to register
        </Link>
      </div>
    </div>
  )
}