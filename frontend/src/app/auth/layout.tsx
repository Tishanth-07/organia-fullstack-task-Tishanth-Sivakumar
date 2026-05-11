import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    /*
      flex-1 fills the remaining height inside the root min-h-screen wrapper.
      This means the auth shell always occupies full viewport — no blank space.
    */
    <div className="flex-1 flex font-body">

      {/* ── Left branding panel (lg+) ─────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 border-r border-[var(--color-border)] bg-[var(--color-surface)]/60 relative overflow-hidden">

        {/* Subtle inner glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[var(--color-accent-glow)] blur-[80px] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow)] group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="6" height="1.5" rx="0.75" fill="white" opacity="0.9"/>
              <rect x="3" y="7.5" width="9" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
              <rect x="3" y="11" width="7" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
              <circle cx="15" cy="14" r="3.5" stroke="white" strokeWidth="1.4" fill="none"/>
              <path d="M13.5 14l1 1 2-2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[1.05rem] font-bold tracking-tight font-display text-[var(--color-fg)]">Nintro</span>
        </Link>

        {/* Main copy */}
        <div className="space-y-10">
          <div>
            <h2 className="text-[2.4rem] font-black leading-tight font-display text-[var(--color-fg)] mb-4">
              Everything you need to
              <span className="block gradient-text">do great work.</span>
            </h2>
            <p className="text-[var(--color-fg-3)] text-[0.88rem] leading-relaxed max-w-sm">
              Join thousands of teams using Nintro to plan, track, and ship — with less chaos and more clarity.
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {[
              { stat: '10k+', label: 'Active teams' },
              { stat: '99.9%', label: 'Uptime SLA' },
              { stat: '4.9★', label: 'Average rating' },
            ].map(({ stat, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="text-xl font-black text-[var(--color-fg)] font-display w-20">{stat}</div>
                <div className="text-[0.78rem] text-[var(--color-fg-3)]">{label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="card p-5">
            <p className="text-[var(--color-fg-2)] text-[0.8rem] leading-relaxed mb-4 italic">
              "Nintro completely changed how our team operates. We ship 30% faster now."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[0.68rem] font-bold text-white">SR</div>
              <div>
                <p className="text-[0.78rem] font-semibold text-[var(--color-fg)]">Sarah R.</p>
                <p className="text-[0.7rem] text-[var(--color-fg-3)]">Head of Product, Vercel</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[var(--color-fg-4)] text-[0.7rem]">© {new Date().getFullYear()} Nintro</p>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-white/80" />
            </div>
            <span className="text-[0.95rem] font-bold font-display text-[var(--color-fg)]">Nintro</span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}