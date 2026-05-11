'use client';

import { useTasksStore } from '@/store/tasks-store';

/**
 * EmptyState Component Props
 * @property {boolean} isFiltered - Indicates if the user currently has search/filter criteria applied.
 */
interface EmptyStateProps {
  isFiltered: boolean;
}

/**
 * EmptyState Component
 * Displays a helpful visual message when no tasks are available in the current view.
 * Handles two distinct scenarios: 
 * 1. Filtering/Search resulted in zero matches.
 * 2. The entire user task collection is empty.
 */
export default function EmptyState({ isFiltered }: EmptyStateProps) {
  const { openCreate, fetchTasks } = useTasksStore();

  // ── Scenario A: No results for current filters ─────────────────────────────
  
  if (isFiltered) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h3 className="empty-title">No tasks found</h3>
        <p className="empty-desc">Adjust your search or filters to find what you&apos;re looking for.</p>
        
        <button 
          className="btn-ghost mt-2" 
          onClick={() => fetchTasks({ status: undefined, search: undefined, page: 1 })}
        >
          Clear all filters
        </button>
      </div>
    );
  }

  // ── Scenario B: Global empty state (Initial Onboarding) ────────────────────

  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-icon empty-icon-glow">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
      <h3 className="empty-title">Your task board is empty</h3>
      <p className="empty-desc">
        Take control of your day by creating your first task. 
        Organize, track, and ship work beautifully.
      </p>
      
      <button className="btn-primary empty-cta" onClick={openCreate}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create My First Task
      </button>
    </div>
  );
}