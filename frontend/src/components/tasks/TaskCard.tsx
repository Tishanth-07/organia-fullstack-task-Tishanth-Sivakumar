'use client';

import { useState } from 'react';
import type { Task, TaskStatus } from '@/types/task';
import { TASK_STATUS_LABELS } from '@/types/task';
import { useTasksStore } from '@/store/tasks-store';

/**
 * Interface for TaskCard component props.
 */
interface TaskCardProps {
  task: Task;
}

// ── Configuration & Helpers ──────────────────────────────────────────────────

/** Cycles through statuses: ToDo -> InProgress -> Completed -> ToDo */
const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  ToDo:       'InProgress',
  InProgress: 'Completed',
  Completed:  'ToDo',
};

/** UI styles and labels for each status */
const STATUS_STYLES: Record<TaskStatus, { badge: string; dot: string; next: string }> = {
  ToDo:       { badge: 'badge-todo',     dot: 'dot-todo',     next: 'Move to In Progress' },
  InProgress: { badge: 'badge-progress', dot: 'dot-progress', next: 'Mark as Completed'   },
  Completed:  { badge: 'badge-done',     dot: 'dot-done',     next: 'Reset to To Do'      },
};

/** Formats a date string into a human-readable format */
function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Calculates and returns a relative due date string (e.g., "Due today", "2d overdue") */
function relativeDue(iso: string | null, isOverdue: boolean): string {
  if (!iso) return '';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (isOverdue) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff < 7 && diff > 0) return `Due in ${diff}d`;
  
  return formatDate(iso) ?? '';
}

/**
 * TaskCard Component
 * Displays individual task details and provides quick actions for status updates,
 * editing, and deletion.
 */
export default function TaskCard({ task }: TaskCardProps) {
  const { openEdit, setDeletingId, quickStatus } = useTasksStore();
  
  // ── State ──────────────────────────────────────────────────────────────────
  
  const [cycling, setCycling] = useState(false);

  // ── Computed Values ────────────────────────────────────────────────────────
  
  const style   = STATUS_STYLES[task.status];
  const dueTxt  = relativeDue(task.dueDate, task.isOverdue);

  // ── Handlers ───────────────────────────────────────────────────────────────
  
  /** Updates the task to the next logical status */
  const handleCycle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cycling) return;
    
    setCycling(true);
    try {
      await quickStatus(task.id, STATUS_CYCLE[task.status]);
    } finally {
      setCycling(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="task-card group animate-in fade-in slide-in-from-bottom-2 duration-300"
      onClick={() => openEdit(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openEdit(task)}
      aria-label={`Edit task: ${task.title}`}
    >
      {/* Visual indicator for overdue tasks */}
      {task.isOverdue && task.status !== 'Completed' && (
        <div className="task-overdue-stripe" aria-hidden />
      )}

      {/* Header: Status Badge & Hover Actions */}
      <div className="task-card-header">
        <span className={`status-badge ${style.badge}`}>
          <span className={`status-dot ${style.dot}`} />
          {TASK_STATUS_LABELS[task.status]}
        </span>

        <div className="task-actions" onClick={(e) => e.stopPropagation()}>
          {/* Action: Quick Status Cycle */}
          <button
            className="task-action-btn"
            title={style.next}
            onClick={handleCycle}
            disabled={cycling}
            aria-label={style.next}
          >
            {cycling ? (
              <svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            )}
          </button>

          {/* Action: Edit */}
          <button
            className="task-action-btn"
            title="Edit task"
            onClick={(e) => { e.stopPropagation(); openEdit(task); }}
            aria-label="Edit task"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Action: Delete */}
          <button
            className="task-action-btn task-action-danger"
            title="Delete task"
            onClick={(e) => { e.stopPropagation(); setDeletingId(task.id); }}
            aria-label="Delete task"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content: Title & Description */}
      <h3 className={`task-title ${task.status === 'Completed' ? 'task-title-done' : ''}`}>
        {task.title}
      </h3>

      {task.description && (
        <p className="task-desc line-clamp-2">{task.description}</p>
      )}

      {/* Footer: Due Date & Metadata */}
      <div className="task-footer">
        {task.dueDate ? (
          <span suppressHydrationWarning className={`task-due ${task.isOverdue && task.status !== 'Completed' ? 'task-due-overdue' : task.status === 'Completed' ? 'task-due-done' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {dueTxt}
          </span>
        ) : (
          <span className="task-due task-due-none">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            No due date
          </span>
        )}

        <span suppressHydrationWarning className="task-age">
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}