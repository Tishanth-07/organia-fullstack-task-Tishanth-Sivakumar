'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  // ── State: OTP & Workflow ──────────────────────────────────────────────────
  const [code, setCode]           = useState(['', '', '', '', '', ''])
  const [loading, setLoading]     = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown]   = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  /**
   * Lifecycle: Manage the resend cooldown timer.
   */
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // ── Handlers: Input Logic ──────────────────────────────────────────────────

  /**
   * Processes individual character inputs and auto-focuses the next field.
   */
  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  /**
   * Handles keyboard navigation (e.g., Backspace for deleting and focusing previous).
   */
  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  /**
   * Supports pasting full 6-digit codes into the input segments.
   */
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const data = e.clipboardData.getData('text').slice(0, 6).split('')
    if (data.every(char => /^\d$/.test(char))) {
      const newCode = [...code]
      data.forEach((char, i) => { newCode[i] = char })
      setCode(newCode)
      inputRefs.current[Math.min(data.length, 5)]?.focus()
    }
  }

  // ── Handlers: Workflow ─────────────────────────────────────────────────────

  /**
   * Submits the 6-digit code for account activation.
   */
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

  /**
   * Requests a new verification code from the backend.
   */
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Icon + Heading */}
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

      {/* OTP Input Boxes */}
      <div className="space-y-4" onPaste={handlePaste}>
        <label className="field-label">Verification code</label>
        <div className="flex gap-2.5">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
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

        {/* Dynamic Progress indicator */}
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

      {/* Resend Actions */}
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