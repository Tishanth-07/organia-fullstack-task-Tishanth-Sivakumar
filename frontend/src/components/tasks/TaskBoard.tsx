'use client';

import TaskCard from './TaskCard';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { useTasksStore } from '@/store/tasks-store';

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

export default function TaskBoard() {
  const { tasks, isLoading, error, query } = useTasksStore();
  const isFiltered = !!(query.status || query.search);

  if (error) {
    return (
      <div className="board-error">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="task-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return <EmptyState isFiltered={isFiltered} />;
  }

  return (
    <>
      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <Pagination />
    </>
  );
}