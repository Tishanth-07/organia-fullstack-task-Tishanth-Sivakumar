'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTasksStore } from '@/store/tasks-store';

export default function DeleteConfirmModal() {
  const { deletingTaskId, tasks, setDeletingId, deleteTask } = useTasksStore();
  const [loading, setLoading] = useState(false);

  if (!deletingTaskId) return null;

  const task = tasks.find((t) => t.id === deletingTaskId);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTask(deletingTaskId);
      toast.success('Task deleted');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => { if (!loading) setDeletingId(null); }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="modal-panel delete-panel animate-fade-up" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className="delete-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </div>

        <h2 id="delete-title" className="delete-title">Delete Task?</h2>
        <p className="delete-body">
          <strong>&ldquo;{task?.title ?? 'this task'}&rdquo;</strong> will be permanently removed.
          This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button
            className="btn-ghost"
            onClick={() => setDeletingId(null)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
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
            ) : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
}