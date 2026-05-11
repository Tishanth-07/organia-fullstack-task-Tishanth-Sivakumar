/**
 * Defines the possible lifecycle stages of a task.
 */
export type TaskStatus = 'ToDo' | 'InProgress' | 'Completed';

/**
 * Human-readable labels for each task status.
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  ToDo:       'To Do',
  InProgress: 'In Progress',
  Completed:  'Completed',
};

/**
 * CSS utility classes for styling status badges.
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  ToDo:       'status-todo',
  InProgress: 'status-progress',
  Completed:  'status-done',
};

/**
 * Main Task interface representing a task entity from the backend.
 */
export interface Task {
  /** Unique identifier (GUID) */
  id:          string;
  /** Primary title of the task */
  title:       string;
  /** Detailed information or notes */
  description: string | null;
  /** Current state of the task */
  status:      TaskStatus;
  /** Optional deadline in ISO 8601 format */
  dueDate:     string | null;
  /** Timestamp when the task was created */
  createdAt:   string;
  /** Timestamp of the last update */
  updatedAt:   string;
  /** Flag indicating if the current date is past the due date (calculated on backend) */
  isOverdue:   boolean;
}

// ── API Payloads ──────────────────────────────────────────────────────────────

/** Payload used when creating a new task */
export interface CreateTaskPayload {
  title:       string;
  description?: string;
  status:      TaskStatus;
  dueDate?:    string | null;
}

/** Payload used for patching/updating an existing task */
export interface UpdateTaskPayload {
  title?:       string;
  description?: string;
  status?:      TaskStatus;
  dueDate?:     string | null;
}

/** Parameters for querying and filtering the task list */
export interface TaskQuery {
  status?:    TaskStatus;
  search?:    string;
  sortBy?:    'createdAt' | 'dueDate' | 'title' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?:      number;
  pageSize?:  number;
}

// ── Response Models ──────────────────────────────────────────────────────────

/**
 * Wrapper for paginated task responses.
 * Includes both the item collection and aggregate analytics.
 */
export interface PagedTasks {
  /** The collection of tasks for the current page */
  items:           Task[];
  
  // Pagination Metadata
  totalCount:      number;
  page:            number;
  pageSize:        number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
  
  // Summary Statistics
  toDoCount:       number;
  inProgressCount: number;
  completedCount:  number;
  overdueCount:    number;
}