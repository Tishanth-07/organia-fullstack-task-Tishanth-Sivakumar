'use client';

import { useTasksStore } from '@/store/tasks-store';

/**
 * Pagination Component
 * Orchestrates the navigation across paginated task data sets.
 * Features smart ellipsis logic to handle large page counts and a
 * dynamic page size selector.
 */
export default function Pagination() {
  const { pagedTasks, query, fetchTasks } = useTasksStore();
  
  // ── Early Exit ─────────────────────────────────────────────────────────────
  
  // No pagination UI needed if there is no data or only one page
  if (!pagedTasks || pagedTasks.totalPages <= 1) return null;

  const { page, totalPages, totalCount, pageSize } = pagedTasks;

  // Calculate the range of items currently displayed
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalCount);

  // ── Helper: Navigation Action ─────────────────────────────────────────────

  const navigateToPage = (p: number) => fetchTasks({ page: p });

  // ── Logic: Smart Page Range Generation ────────────────────────────────────

  /**
   * Generates a sequence of page numbers and ellipses.
   * Pattern: [First] ... [Current-1] [Current] [Current+1] ... [Last]
   */
  const pageItems: (number | '…')[] = [];
  const visiblePages = new Set<number>();
  
  [1, page - 1, page, page + 1, totalPages].forEach((p) => {
    if (p >= 1 && p <= totalPages) visiblePages.add(p);
  });
  
  const sortedPages = [...visiblePages].sort((a, b) => a - b);
  
  sortedPages.forEach((p, i) => {
    // Add ellipsis if there's a gap between sequential numbers
    if (i > 0 && p - sortedPages[i - 1] > 1) pageItems.push('…');
    pageItems.push(p);
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pagination-root animate-fade-in">
      
      {/* Informational Summary */}
      <span className="pagination-info">
        Showing <span className="font-bold text-[var(--color-fg-2)]">{from}–{to}</span> of {totalCount}
      </span>

      {/* Control Navigation */}
      <div className="pagination-controls">
        
        {/* Navigation: Previous Page */}
        <button
          className="page-btn"
          onClick={() => navigateToPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Dynamic Page Number Grid */}
        {pageItems.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === page ? 'page-btn-active' : ''}`}
              onClick={() => navigateToPage(p as number)}
              aria-label={`Go to page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Navigation: Next Page */}
        <button
          className="page-btn"
          onClick={() => navigateToPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Configuration: Page Size Selector */}
      <div className="page-size-wrap">
        <span className="page-size-label">Per page</span>
        <select
          className="page-size-select"
          value={query.pageSize ?? 9}
          onChange={(e) => fetchTasks({ pageSize: Number(e.target.value), page: 1 })}
          aria-label="Items per page"
        >
          {[6, 9, 12, 24].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

    </div>
  );
}