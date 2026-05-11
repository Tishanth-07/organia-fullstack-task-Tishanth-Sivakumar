'use client';

import { useCallback, useRef, useState } from 'react';
import { useTasksStore } from '@/store/tasks-store';
import type { TaskStatus } from '@/types/task';
import { TASK_STATUS_LABELS } from '@/types/task';

const STATUS_OPTIONS: Array<{ value: TaskStatus | ''; label: string }> = [
  { value: '',           label: 'All Tasks'   },
  { value: 'ToDo',       label: 'To Do'        },
  { value: 'InProgress', label: 'In Progress'  },
  { value: 'Completed',  label: 'Completed'    },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'dueDate',   label: 'Due Date'     },
  { value: 'title',     label: 'Title'        },
];

export default function TaskFilters() {
  const { query, pagedTasks, fetchTasks, openCreate } = useTasksStore();
  const [search, setSearch] = useState(query.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTasks({ search: val || undefined, page: 1 });
    }, 350);
  }, [fetchTasks]);

  const handleStatus = (val: string) => {
    fetchTasks({ status: (val as TaskStatus) || undefined, page: 1 });
  };

  const handleSort = (val: string) => {
    fetchTasks({ sortBy: val as never, page: 1 });
  };

  const toggleOrder = () => {
    fetchTasks({ sortOrder: query.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 });
  };

  const counts = pagedTasks;

  return (
    <div className="filters-root">
      {/* ── Summary chips ──────────────────────────────────────── */}
      {counts && (
        <div className="summary-chips">
          <button
            className={`summary-chip ${!query.status ? 'chip-active' : ''}`}
            onClick={() => handleStatus('')}
          >
            <span className="chip-count">{counts.toDoCount + counts.inProgressCount + counts.completedCount}</span>
            All
          </button>
          <button
            className={`summary-chip ${query.status === 'ToDo' ? 'chip-active chip-todo' : ''}`}
            onClick={() => handleStatus('ToDo')}
          >
            <span className="dot-todo chip-dot" />
            <span className="chip-count">{counts.toDoCount}</span>
            To Do
          </button>
          <button
            className={`summary-chip ${query.status === 'InProgress' ? 'chip-active chip-progress' : ''}`}
            onClick={() => handleStatus('InProgress')}
          >
            <span className="dot-progress chip-dot" />
            <span className="chip-count">{counts.inProgressCount}</span>
            In Progress
          </button>
          <button
            className={`summary-chip ${query.status === 'Completed' ? 'chip-active chip-done' : ''}`}
            onClick={() => handleStatus('Completed')}
          >
            <span className="dot-done chip-dot" />
            <span className="chip-count">{counts.completedCount}</span>
            Completed
          </button>
          {counts.overdueCount > 0 && (
            <span className="summary-chip chip-overdue">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {counts.overdueCount} Overdue
            </span>
          )}
        </div>
      )}

      {/* ── Controls row ───────────────────────────────────────── */}
      <div className="filter-controls">
        {/* Search */}
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            aria-label="Search tasks"
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => handleSearch('')}
              aria-label="Clear search"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort by */}
        <div className="select-wrap">
          <svg className="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="21" y1="10" x2="7" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="7" y2="18" />
          </svg>
          <select
            value={query.sortBy ?? 'createdAt'}
            onChange={(e) => handleSort(e.target.value)}
            className="filter-select"
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Sort direction */}
        <button
          className="sort-dir-btn"
          onClick={toggleOrder}
          title={query.sortOrder === 'asc' ? 'Ascending — click for descending' : 'Descending — click for ascending'}
          aria-label="Toggle sort direction"
        >
          {query.sortOrder === 'asc' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          )}
        </button>

        {/* Spacer */}
        <div className="filter-spacer" />

        {/* New task button */}
        <button className="btn-primary filter-new-btn" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>
    </div>
  );
}