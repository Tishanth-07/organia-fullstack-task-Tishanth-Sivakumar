'use client';

import { useTasksStore } from '@/store/tasks-store';

export default function Pagination() {
  const { pagedTasks, query, fetchTasks } = useTasksStore();
  if (!pagedTasks || pagedTasks.totalPages <= 1) return null;

  const { page, totalPages, totalCount, pageSize } = pagedTasks;
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalCount);

  const go = (p: number) => fetchTasks({ page: p });

  // Build page numbers to show: always first, last, and ±1 around current
  const pages: (number | '…')[] = [];
  const show = new Set<number>();
  [1, page - 1, page, page + 1, totalPages].forEach((p) => {
    if (p >= 1 && p <= totalPages) show.add(p);
  });
  const sorted = [...show].sort((a, b) => a - b);
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) pages.push('…');
    pages.push(p);
  });

  return (
    <div className="pagination-root">
      <span className="pagination-info">
        {from}–{to} of {totalCount} tasks
      </span>

      <div className="pagination-controls">
        {/* Prev */}
        <button
          className="page-btn"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === page ? 'page-btn-active' : ''}`}
              onClick={() => go(p as number)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          className="page-btn"
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Page size selector */}
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