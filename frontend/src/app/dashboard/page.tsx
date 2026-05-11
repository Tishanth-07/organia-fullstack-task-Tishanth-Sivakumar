'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasks-store';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskModal from '@/components/tasks/TaskModal';
import DeleteConfirmModal from '@/components/tasks/DeleteConfirmModal';

// ── Grab user from auth store / localStorage ───────────────────────────────────
function getUser(): { name?: string; email?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth_user') ?? sessionStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : 'U';
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router  = useRouter();
  const [user, setUser]   = useState<{ name?: string; email?: string } | null>(null);
  const [greet, setGreet] = useState('Hello');
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
    setGreet(greeting());
  }, []);
  const { fetchTasks, pagedTasks, openCreate } = useTasksStore();
  const logout = useAuthStore((s) => s.logout);

  // Auth guard
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) { router.replace('/'); return; }
    fetchTasks();
  }, [fetchTasks, router]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.replace('/');
  };

  const initials    = getInitials(user?.name, user?.email);
  const displayName = user?.name ?? user?.email ?? 'User';
  const counts      = pagedTasks;

  return (
    <div className="page-shell">
      <div className="ambient ambient-1" aria-hidden />
      <div className="ambient ambient-2" aria-hidden />
      <div className="dot-grid"          aria-hidden />

      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className="dashboard-nav">
        <div className="nav-inner">
          {/* Logo */}
          <div className="nav-logo">
            <div className="nav-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="nav-logo-text">Nintro</span>
          </div>

          <div className="nav-right">
            {/* New task shortcut */}
            <button className="nav-new-btn" onClick={openCreate} aria-label="Create new task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Task</span>
            </button>

            {/* Avatar menu */}
            <div className="avatar-wrap">
              <button
                className="avatar-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="User menu"
              >
                <span className="avatar-initials">{initials}</span>
                <svg
                  className={`avatar-chevron ${menuOpen ? 'rotate-180' : ''}`}
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="avatar-overlay" onClick={() => setMenuOpen(false)} />
                  <div className="avatar-menu" role="menu">
                    <div className="avatar-menu-header">
                      <div className="avatar-menu-initials">{initials}</div>
                      <div>
                        <div className="avatar-menu-name">{displayName}</div>
                        {user?.email && <div className="avatar-menu-email">{user.email}</div>}
                      </div>
                    </div>
                    <div className="avatar-menu-divider" />
                    <button
                      className="avatar-menu-item avatar-menu-logout"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="dashboard-main">

        {/* Hero greeting */}
        <div className="dash-hero animate-fade-up">
          <div>
            <h1 className="dash-greeting">
              {greet}, <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
            </h1>
            <p className="dash-sub">
              {counts
                ? `You have ${counts.toDoCount + counts.inProgressCount} active task${(counts.toDoCount + counts.inProgressCount) !== 1 ? 's' : ''}${counts.overdueCount > 0 ? ` · ${counts.overdueCount} overdue` : ''}.`
                : 'Track your work and ship faster.'}
            </p>
          </div>
        </div>

        {/* Stats bar */}
        {counts && (
          <div className="stats-bar animate-fade-up delay-100">
            <div className="stat-card">
              <div className="stat-icon stat-icon-todo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div>
                <div className="stat-value">{counts.toDoCount}</div>
                <div className="stat-label">To Do</div>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat-card">
              <div className="stat-icon stat-icon-progress">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a9 9 0 1 0 9 9" />
                  <polyline points="12 8 12 12 15 15" />
                </svg>
              </div>
              <div>
                <div className="stat-value">{counts.inProgressCount}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat-card">
              <div className="stat-icon stat-icon-done">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <div className="stat-value">{counts.completedCount}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            {counts.overdueCount > 0 && (
              <>
                <div className="stat-divider" />
                <div className="stat-card">
                  <div className="stat-icon stat-icon-overdue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <div className="stat-value stat-value-overdue">{counts.overdueCount}</div>
                    <div className="stat-label">Overdue</div>
                  </div>
                </div>
              </>
            )}

            {/* Progress bar */}
            <div className="stat-progress-wrap">
              <div className="stat-progress-label">
                <span>Overall progress</span>
                <span>
                  {counts.toDoCount + counts.inProgressCount + counts.completedCount > 0
                    ? Math.round((counts.completedCount / (counts.toDoCount + counts.inProgressCount + counts.completedCount)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="stat-progress-track">
                <div
                  className="stat-progress-fill"
                  style={{
                    width: `${
                      counts.toDoCount + counts.inProgressCount + counts.completedCount > 0
                        ? Math.round((counts.completedCount / (counts.toDoCount + counts.inProgressCount + counts.completedCount)) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="animate-fade-up delay-200">
          <TaskFilters />
        </div>

        {/* Board */}
        <div className="animate-fade-up delay-300">
          <TaskBoard />
        </div>
      </main>

      {/* ── Modals ───────────────────────────────────────────── */}
      <TaskModal />
      <DeleteConfirmModal />
    </div>
  );
}