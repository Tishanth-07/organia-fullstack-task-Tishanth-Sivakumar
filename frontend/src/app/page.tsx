import Link from 'next/link'

export default function LandingPage() {
  return (
    // page-shell = min-h-screen flex flex-col — fills the outer min-h-screen wrapper
    <div className="page-shell font-body">

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <nav className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow)]">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="6" height="1.5" rx="0.75" fill="white" opacity="0.9"/>
                <rect x="3" y="7.5" width="9" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
                <rect x="3" y="11" width="7" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
                <circle cx="15" cy="14" r="3.5" stroke="white" strokeWidth="1.4" fill="none"/>
                <path d="M13.5 14l1 1 2-2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[1rem] font-bold tracking-tight font-display text-[var(--color-fg)]">Nintro</span>
          </div>

          <div className="hidden md:flex items-center gap-7">
            {['Features', 'Pricing', 'Docs', 'Blog'].map(item => (
              <a key={item} href="#" className="text-[0.8rem] font-medium text-[var(--color-fg-3)] hover:text-[var(--color-fg-2)] transition-colors duration-200 tracking-wide">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block text-[0.8rem] font-medium text-[var(--color-fg-2)] hover:text-[var(--color-fg)] transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-primary !w-auto px-5 py-2.5 text-[0.8rem]">
              Get started →
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <section className="flex flex-col items-center text-center px-6 pt-20 pb-10 max-w-5xl mx-auto w-full">

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent-dim)] text-[var(--color-green-light)] text-[0.7rem] font-bold tracking-widest uppercase mb-10 animate-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-green-light)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-green-light)]" />
            </span>
            10,000+ teams trust Nintro
          </div>

          <h1 className="text-[3rem] md:text-[5.5rem] font-black tracking-tight leading-[1.03] font-display mb-6 max-w-4xl animate-fade-up delay-100">
            <span className="text-[var(--color-fg)]">Your work,</span>
            <br />
            <span className="gradient-text">beautifully organized.</span>
          </h1>

          <p className="text-[var(--color-fg-2)] text-[1.05rem] max-w-lg mb-10 leading-relaxed animate-fade-up delay-200">
            The workspace that keeps your team in sync. Create tasks, track progress, hit every deadline — with less friction than ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-5 animate-fade-up delay-300">
            <Link href="/auth/register" className="w-full sm:w-auto bg-white text-[#020509] hover:bg-[#f0f4f8] px-8 py-3.5 rounded-xl font-bold text-[0.875rem] transition-all duration-200 hover:-translate-y-px shadow-xl shadow-white/10 font-display">
              Start free — no card needed
            </Link>
            <Link href="/auth/login" className="btn-ghost w-full sm:w-auto px-8 py-3.5 text-[0.875rem]">
              View live demo
            </Link>
          </div>
          <p className="text-[var(--color-fg-4)] text-[0.72rem] font-medium animate-fade-up delay-400">Free forever · No credit card · Cancel anytime</p>

          {/* App mockup */}
          <div className="w-full max-w-3xl mt-16 animate-fade-up delay-400">
            <div className="rounded-2xl border border-[var(--color-border-2)] bg-[var(--color-surface)] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <div className="flex-1 flex justify-center">
                  <div className="bg-[var(--color-surface-3)] text-[var(--color-fg-3)] text-[0.7rem] px-4 py-1 rounded-lg flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    app.nintro.io/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="p-6 grid grid-cols-3 gap-4 min-h-[220px]">
                {/* Task list */}
                <div className="col-span-2 space-y-2.5">
                  <p className="text-[0.65rem] font-bold text-[var(--color-fg-3)] uppercase tracking-widest mb-3">Active Tasks</p>
                  {[
                    { label: 'Redesign onboarding flow', status: 'In Progress', w: '72%', color: '#fbbf24' },
                    { label: 'Fix API auth edge cases', status: 'To Do', w: '45%', color: '#60a5fa' },
                    { label: 'Write Q3 release notes', status: 'Completed', w: '100%', color: '#4ade80' },
                    { label: 'Review analytics dashboard', status: 'In Progress', w: '58%', color: '#fbbf24' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[var(--color-surface-3)] rounded-xl px-4 py-3 border border-[var(--color-border)]">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: t.color }} />
                      <span className="text-[0.78rem] text-[var(--color-fg-2)] flex-1 truncate">{t.label}</span>
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="w-20 h-1 rounded-full bg-[var(--color-border-2)]">
                          <div className="h-1 rounded-full transition-all" style={{ width: t.w, backgroundColor: t.color }} />
                        </div>
                        <span className="text-[0.65rem] text-[var(--color-fg-3)]">{t.w}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Stats panel */}
                <div className="space-y-3">
                  <p className="text-[0.65rem] font-bold text-[var(--color-fg-3)] uppercase tracking-widest mb-3">Overview</p>
                  {[
                    { label: 'Completion', value: '84%', color: '#4ade80' },
                    { label: 'Tasks done', value: '27',  color: '#60a5fa' },
                    { label: 'Overdue',    value: '3',   color: '#f87171' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[var(--color-surface-3)] rounded-xl p-4 border border-[var(--color-border)]">
                      <p className="text-[0.65rem] text-[var(--color-fg-3)] mb-1">{s.label}</p>
                      <p className="text-[1.4rem] font-black font-display" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ─────────────────────────────────── */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/40 py-10 mt-4">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 max-w-4xl mx-auto px-6">
            {[
              { stat: '10k+', label: 'Teams active' },
              { stat: '99.9%', label: 'Uptime SLA' },
              { stat: '4.9★', label: 'Average rating' },
              { stat: '<50ms', label: 'API response' },
            ].map(({ stat, label }) => (
              <div key={label} className="text-center">
                <p className="text-[2rem] font-black font-display gradient-text leading-none">{stat}</p>
                <p className="text-[0.75rem] text-[var(--color-fg-3)] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature cards ───────────────────────────────── */}
        <section className="px-6 py-20 max-w-6xl mx-auto w-full">
          <div className="text-center mb-14">
            <p className="text-[0.7rem] font-bold text-[var(--color-accent)] uppercase tracking-[0.2em] mb-3">Everything you need</p>
            <h2 className="text-[2.2rem] md:text-[3rem] font-black font-display text-[var(--color-fg)] leading-tight">
              Built for how teams<br/>actually work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{color:'var(--color-green-light)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Task Board',
                desc: 'Drag-and-drop kanban boards. Move tasks from To Do → In Progress → Done with one click.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{color:'var(--color-green-light)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Due Date Tracking',
                desc: 'Never miss a deadline. Visual countdowns and overdue alerts keep every task on time.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{color:'var(--color-green-light)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Progress Analytics',
                desc: 'Real-time dashboards show completion rates, velocity, and team workload at a glance.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{color:'var(--color-green-light)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                ),
                title: 'Smart Filters',
                desc: 'Filter by status, due date, assignee, or priority. Find any task in under a second.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{color:'var(--color-green-light)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Secure by Default',
                desc: 'JWT authentication, encrypted storage, and role-based access keep your data safe.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{color:'var(--color-green-light)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Lightning Fast',
                desc: 'Instant task creation and updates. No page reloads, no lag — just pure speed.',
              },
            ].map((f, i) => (
              <div key={i} className="group p-7 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface-3)] transition-all duration-300 cursor-default">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border-2)] flex items-center justify-center mb-5 group-hover:bg-[var(--color-accent-dim)] group-hover:border-[var(--color-accent)]/25 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-[0.95rem] font-bold font-display text-[var(--color-fg)] mb-2.5">{f.title}</h3>
                <p className="text-[var(--color-fg-3)] text-[0.8rem] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonial ─────────────────────────────────── */}
        <section className="px-6 pb-20 max-w-3xl mx-auto w-full text-center">
          <div className="card p-10">
            <div className="flex justify-center mb-5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-[#fbbf24]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[var(--color-fg-2)] text-[1.05rem] leading-relaxed mb-6 italic">
              "Nintro completely changed how our team operates. We cut standup time in half because everyone can see task status instantly."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[0.7rem] font-bold text-white">SR</div>
              <div className="text-left">
                <p className="text-[0.82rem] font-semibold text-[var(--color-fg)]">Sarah R.</p>
                <p className="text-[0.72rem] text-[var(--color-fg-3)]">Head of Product, Vercel</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-7 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-sm bg-white/80" />
            </div>
            <p className="text-[var(--color-fg-4)] text-[0.72rem] font-medium">
              © {new Date().getFullYear()} Nintro — All rights reserved
            </p>
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Twitter', 'GitHub'].map(link => (
              <a key={link} href="#" className="text-[var(--color-fg-4)] hover:text-[var(--color-fg-3)] text-[0.72rem] transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}