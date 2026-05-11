'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTasksStore } from '@/store/tasks-store';

/**
 * DeleteConfirmModal Component
 * Provides a critical confirmation step before destructive task removal.
 * Uses the global tasks store to track the task targeted for deletion.
 */
export default function DeleteConfirmModal() {
  const { deletingTaskId, tasks, setDeletingId, deleteTask } = useTasksStore();
  const [loading, setLoading] = useState(false);

  // ── Early Exit ─────────────────────────────────────────────────────────────
  
  if (!deletingTaskId) return null;

  // Identify the specific task being targeted
  const task = tasks.find((t) => t.id === deletingTaskId);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /**
   * Dispatches the delete request to the store and handles the resulting feedback.
   */
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTask(deletingTaskId);
      toast.success('Task permanently removed.');
      // Deletion ID is cleared automatically by the store logic on success
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="modal-overlay"
      onClick={() => { if (!loading) setDeletingId(null); }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="modal-panel delete-panel animate-fade-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Visual Cue: Warning Icon */}
        <div className="delete-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </div>

        {/* Content: Title & Warning Body */}
        <h2 id="delete-title" className="delete-title">Delete Task?</h2>
        <p className="delete-body">
          You are about to permanently remove 
          <br />
          <strong className="text-[var(--color-fg)] italic">&ldquo;{task?.title ?? 'this task'}&rdquo;</strong>.
          <br />
          This action is irreversible.
        </p>

        {/* Action Footer */}
        <div className="modal-actions mt-4">
          <button
            className="btn-ghost"
            onClick={() => setDeletingId(null)}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            className="btn-danger flex items-center justify-center gap-2"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Deleting…
              </>
            ) : 'Yes, Delete Task'}
          </button>
        </div>

      </div>
    </div>
  );
}