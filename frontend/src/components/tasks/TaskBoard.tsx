'use client';

import TaskCard from './TaskCard';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { useTasksStore } from '@/store/tasks-store';

// ── Internal Components ──────────────────────────────────────────────────────

/**
 * Loading placeholder for a task card.
 */
function SkeletonCard() {
  return (
    <div className="task-card skeleton-card" aria-hidden>
      <div className="skeleton skeleton-badge" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc short" />
      <div className="skeleton-footer">
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-chip short" />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

/**
 * TaskBoard Component
 * The central container for displaying the user's task collection.
 * Handles loading, error, empty, and populated states with pagination support.
 */
export default function TaskBoard() {
  const { tasks, isLoading, error, query } = useTasksStore();
  
  // Determine if we are currently viewing filtered results
  const isFiltered = !!(query.status || query.search);

  // ── Render: Error State ────────────────────────────────────────────────────
  
  if (error) {
    return (
      <div className="board-error animate-in fade-in duration-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  // ── Render: Loading State ──────────────────────────────────────────────────
  
  if (isLoading) {
    return (
      <div className="task-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // ── Render: Empty State ────────────────────────────────────────────────────
  
  if (!tasks.length) {
    return <EmptyState isFiltered={isFiltered} />;
  }

  // ── Render: Main Board ─────────────────────────────────────────────────────
  
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable grid area */}
      <div className="task-grid flex-grow">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      
      {/* Footer controls */}
      <Pagination />
    </div>
  );
}