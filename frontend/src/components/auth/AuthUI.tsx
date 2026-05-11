import React from 'react'

/* ── Eye icons ── */
export const EyeOpen = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.245 7.148 5 12 5c4.851 0 8.587 3.245 10.158 6.678.118.258.118.57 0 .828-1.571 3.433-5.307 6.678-10.158 6.678-4.85 0-8.587-3.245-10.158-6.678z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export const EyeOff = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-2.228-2.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

/* ── Password strength ── */
export function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8)                                                        score++
  if (/[A-Z]/.test(pw))                                                      score++
  if (/\d/.test(pw))                                                          score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw))                     score++
  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Too weak',  color: '#f87171' },
    1: { label: 'Weak',      color: '#fb923c' },
    2: { label: 'Fair',      color: '#fbbf24' },
    3: { label: 'Good',      color: '#a3e635' },
    4: { label: 'Strong',    color: '#4ade80' },
  }
  return { score, ...map[score] }
}

export function PasswordStrengthBar({ score, color, label }: { score: number; color: string; label: string }) {
  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: i <= score ? color : 'var(--color-border-2)' }}
          />
        ))}
      </div>
      <p className="text-[0.7rem] font-medium transition-colors" style={{ color }}>{label}</p>
    </div>
  )
}

/* ── Field label ── */
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="field-label">{children}</label>
  )
}

/* ── Input class helper ── */
export function inputCls(hasError?: boolean) {
  return ['field-input', hasError ? 'error' : ''].filter(Boolean).join(' ')
}

/* ── Field error ── */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-[var(--color-error)] text-[0.7rem] mt-1.5 flex items-center gap-1.5">
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  )
}

/* ── Alert banner ── */
export function AlertBanner({ type, message }: { type: 'error' | 'success'; message: string }) {
  const isError = type === 'error'
  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 border text-sm ${
      isError
        ? 'bg-red-500/[0.07] border-red-500/20 text-[var(--color-error)]'
        : 'bg-[var(--color-accent-dim)] border-[var(--color-accent)]/20 text-[var(--color-green-light)]'
    }`}>
      {isError ? (
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <p className="text-[0.82rem] leading-relaxed">{message}</p>
    </div>
  )
}

/* ── Submit button ── */
export function SubmitButton({
  isSubmitting,
  label,
  loadingLabel,
}: {
  isSubmitting: boolean
  label: string
  loadingLabel: string
}) {
  return (
    <button type="submit" disabled={isSubmitting} className="btn-primary">
      {isSubmitting ? (
        <>
          <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingLabel}
        </>
      ) : label}
    </button>
  )
}

/* ── Auth heading ── */
export function AuthHeading({
  icon,
  iconBg,
  title,
  subtitle,
}: {
  icon?: React.ReactNode
  iconBg?: string
  title: string
  subtitle: React.ReactNode
}) {
  return (
    <div className="space-y-2 mb-8">
      {icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: iconBg || 'rgba(22,163,74,0.1)',
            border: '1px solid rgba(22,163,74,0.2)',
          }}
        >
          {icon}
        </div>
      )}
      <h2 className="text-[1.85rem] font-black text-[var(--color-fg)] font-display tracking-tight leading-tight">
        {title}
      </h2>
      <p className="text-[var(--color-fg-3)] text-[0.85rem] leading-relaxed">{subtitle}</p>
    </div>
  )
}

/* ── Divider ── */
export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      <span className="text-[0.7rem] text-[var(--color-fg-3)] font-medium uppercase tracking-wider">{text}</span>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  )
}