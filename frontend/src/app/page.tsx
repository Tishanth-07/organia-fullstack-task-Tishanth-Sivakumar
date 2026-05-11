import Link from 'next/link'

/**
 * LandingPage Component
 * The primary public-facing entry point of the Nintro platform.
 * Features a high-conversion hero section, product showcase mockup, 
 * social proof stats, and detailed feature breakdown.
 */
export default function LandingPage() {
  return (
    <div className="page-shell font-body animate-in fade-in duration-1000">

      {/* ── Section: Global Navigation Header ──────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <nav className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto w-full">
          {/* Brand Identity */}
          <div className="flex items-center">
            <span className="text-[1.25rem] font-bold tracking-tight font-display text-[var(--color-fg)]">Nintro</span>
          </div>

          {/* Main Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7">
            {['Features', 'Pricing', 'Docs', 'Blog'].map(item => (
              <a key={item} href="#" className="text-[0.8rem] font-semibold text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] transition-colors duration-200 tracking-wide">
                {item}
              </a>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block text-[0.8rem] font-bold text-[var(--color-fg-2)] hover:text-[var(--color-fg)] transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-primary !w-auto px-5 py-2.5 text-[0.8rem]">
              Get started →
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Section: Hero & Product Showcase ───────────────────── */}
      <main className="flex-1 flex flex-col">
        <section className="flex flex-col items-center text-center px-6 pt-20 pb-10 max-w-5xl mx-auto w-full">

          {/* Dynamic Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent-dim)] text-[var(--color-green-light)] text-[0.7rem] font-bold tracking-widest uppercase mb-10 animate-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-green-light)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-green-light)]" />
            </span>
            Trusted by 10,000+ modern teams
          </div>

          {/* Main Headline */}
          <h1 className="text-[3rem] md:text-[5.5rem] font-black tracking-tight leading-[1.03] font-display mb-6 max-w-4xl animate-fade-up delay-100">
            <span className="text-[var(--color-fg)]">Your work,</span>
            <br />
            <span className="gradient-text">beautifully organized.</span>
          </h1>

          <p className="text-[var(--color-fg-2)] text-[1.05rem] max-w-lg mb-10 leading-relaxed font-medium animate-fade-up delay-200">
            The intelligent workspace that keeps your team in sync. Create tasks, track progress, and hit every deadline — with less friction than ever.
          </p>

          {/* Primary Calls to Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-5 animate-fade-up delay-300">
            <Link href="/auth/register" className="w-full sm:w-auto bg-white text-[#020509] hover:bg-[#f0f4f8] px-8 py-4 rounded-xl font-bold text-[0.95rem] transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-white/10 font-display">
              Start for free
            </Link>
            <Link href="/auth/login" className="btn-ghost w-full sm:w-auto px-8 py-4 text-[0.95rem] border-2">
              View live demo
            </Link>
          </div>
          <p className="text-[var(--color-fg-4)] text-[0.72rem] font-bold animate-fade-up delay-400">Free forever · No credit card required</p>

          {/* Visual: Dashboard Preview Mockup */}
          <div className="w-full max-w-4xl mt-16 animate-fade-up delay-400">
            <div className="rounded-2xl border border-[var(--color-border-2)] bg-[var(--color-surface)] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
              {/* Fake Window Controls */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                  <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[var(--color-surface-3)] text-[var(--color-fg-3)] text-[0.7rem] px-4 py-1.5 rounded-lg font-mono">
                    app.nintro.io/dashboard
                  </div>
                </div>
              </div>
              {/* Preview Content */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left min-h-[300px]">
                <div className="md:col-span-2 space-y-4">
                  <p className="text-[0.65rem] font-black text-[var(--color-fg-3)] uppercase tracking-[0.2em] mb-4">Active Sprint</p>
                  {[
                    { label: 'Redesign onboarding flow', status: 'In Progress', w: '72%', color: '#fbbf24' },
                    { label: 'Fix API auth edge cases', status: 'To Do', w: '45%', color: '#60a5fa' },
                    { label: 'Write Q3 release notes', status: 'Completed', w: '100%', color: '#4ade80' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[var(--color-surface-3)] rounded-xl px-5 py-4 border border-[var(--color-border)] shadow-sm">
                      <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: t.color }} />
                      <span className="text-[0.85rem] text-[var(--color-fg-2)] font-semibold flex-1">{t.label}</span>
                      <div className="w-24 h-1.5 rounded-full bg-[var(--color-border-2)] overflow-hidden">
                        <div className="h-full" style={{ width: t.w, backgroundColor: t.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <p className="text-[0.65rem] font-black text-[var(--color-fg-3)] uppercase tracking-[0.2em] mb-4">Insights</p>
                  <div className="bg-[var(--color-accent-dim)] rounded-xl p-5 border border-[var(--color-accent)]/20">
                    <p className="text-[0.65rem] text-[var(--color-green-light)] font-black uppercase mb-1">Weekly Velocity</p>
                    <p className="text-[2rem] font-black font-display text-[var(--color-green-light)]">+24%</p>
                  </div>
                  <div className="bg-[var(--color-surface-3)] rounded-xl p-5 border border-[var(--color-border)]">
                    <p className="text-[0.65rem] text-[var(--color-fg-3)] font-black uppercase mb-1">Tasks Done</p>
                    <p className="text-[2rem] font-black font-display text-[var(--color-fg)]">84</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: Social Proof Stats ────────────────────────── */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/40 py-12">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 max-w-5xl mx-auto px-6">
            {[
              { stat: '10k+', label: 'Active Teams' },
              { stat: '99.9%', label: 'Uptime SLA' },
              { stat: '4.9★', label: 'Store Rating' },
              { stat: '<50ms', label: 'API Latency' },
            ].map(({ stat, label }) => (
              <div key={label} className="text-center">
                <p className="text-[2.2rem] font-black font-display gradient-text leading-none mb-1">{stat}</p>
                <p className="text-[0.75rem] text-[var(--color-fg-3)] font-bold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: Comprehensive Features ─────────────────────── */}
        <section className="px-6 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <p className="text-[0.7rem] font-black text-[var(--color-accent)] uppercase tracking-[0.3em] mb-4 text-center">Built for performance</p>
            <h2 className="text-[2.5rem] md:text-[3.5rem] font-black font-display text-[var(--color-fg)] leading-tight tracking-tight">
              Everything you need<br/>to ship work faster
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Intelligent Board', desc: 'Manage workflows with powerful drag-and-drop boards and real-time status syncing.' },
              { title: 'Smart Deadlines', desc: 'Predictive overdue alerts and visual countdowns keep your team ahead of every milestone.' },
              { title: 'Advanced Filtering', desc: 'Instantly find any task with multi-layered filtering by status, priority, and date.' },
              { title: 'Team Insights', desc: 'Visualize progress with beautiful analytics dashboards that show team velocity.' },
              { title: 'Enterprise Security', desc: 'Bank-grade encryption, JWT-based auth, and secure role management for your data.' },
              { title: 'API-First Speed', desc: 'Engineered for near-zero latency. Updates reflect instantly across all connected clients.' },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-3)] transition-all duration-300">
                <h3 className="text-lg font-bold font-display text-[var(--color-fg)] mb-3">{f.title}</h3>
                <p className="text-[var(--color-fg-3)] text-[0.85rem] leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Section: Footer ────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <p className="text-[var(--color-fg-4)] text-[0.75rem] font-bold">
              © {new Date().getFullYear()} Nintro — Engineered for high performance.
            </p>
          </div>
          <div className="flex gap-8">
            {['Twitter', 'GitHub', 'Discord', 'Terms'].map(link => (
              <a key={link} href="#" className="text-[var(--color-fg-4)] hover:text-[var(--color-accent)] text-[0.75rem] font-bold transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}