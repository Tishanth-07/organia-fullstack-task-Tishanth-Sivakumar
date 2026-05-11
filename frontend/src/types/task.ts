// ── Task Status ───────────────────────────────────────────────────────────────

export type TaskStatus = 'ToDo' | 'InProgress' | 'Completed';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  ToDo:       'To Do',
  InProgress: 'In Progress',
  Completed:  'Completed',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  ToDo:       'status-todo',
  InProgress: 'status-progress',
  Completed:  'status-done',
};

// ── Task ──────────────────────────────────────────────────────────────────────

export interface Task {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  dueDate:     string | null;   // ISO string from API
  createdAt:   string;
  updatedAt:   string;
  isOverdue:   boolean;
}

// ── API Payloads ──────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title:       string;
  description?: string;
  status:      TaskStatus;
  dueDate?:    string | null;
}

export interface UpdateTaskPayload {
  title?:       string;
  description?: string;
  status?:      TaskStatus;
  dueDate?:     string | null;
}

export interface TaskQuery {
  status?:    TaskStatus;
  search?:    string;
  sortBy?:    'createdAt' | 'dueDate' | 'title' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?:      number;
  pageSize?:  number;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PagedTasks {
  items:           Task[];
  totalCount:      number;
  page:            number;
  pageSize:        number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
  toDoCount:       number;
  inProgressCount: number;
  completedCount:  number;
  overdueCount:    number;
}