import type {
  CreateTaskPayload,
  PagedTasks,
  Task,
  TaskQuery,
  UpdateTaskPayload,
} from '@/types/task';

/**
 * Task API Client
 * Centralizes all task-related communication with the backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5181/api';

// ── Authentication & Header Helpers ─────────────────────────────────────────

/**
 * Retrieves a specific cookie value by name from the browser context.
 * Used primarily for extracting the JWT token.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

/**
 * Generates standard headers for authenticated API requests.
 */
function getAuthHeaders(): HeadersInit {
  const token = getCookie('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Response Handling & Parsing ─────────────────────────────────────────────

/**
 * Standardized handler for API responses.
 * Parses JSON bodies and throws descriptive errors for non-2xx status codes.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed with status ${res.status}`);
  }
  
  // Handle 204 No Content responses
  if (res.status === 204) return undefined as T;
  
  return res.json() as Promise<T>;
}

// ── Query Building ─────────────────────────────────────────────────────────

/**
 * Constructs a URL query string from a TaskQuery object.
 * Sanitizes parameters and ensures correct type conversion for numeric fields.
 */
function buildQuery(params: TaskQuery): string {
  const q = new URLSearchParams();
  
  if (params.status)    q.set('status',    params.status);
  if (params.search)    q.set('search',    params.search);
  if (params.sortBy)    q.set('sortBy',    params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  if (params.page)      q.set('page',      String(params.page));
  if (params.pageSize)  q.set('pageSize',  String(params.pageSize));
  
  const queryString = q.toString();
  return queryString ? `?${queryString}` : '';
}

// ── Exported API Actions ───────────────────────────────────────────────────

export const tasksApi = {
  /**
   * List Tasks
   * Fetches a paginated list of tasks based on filters and sorting criteria.
   */
  list: async (query: TaskQuery = {}): Promise<PagedTasks> => {
    const res = await fetch(`${API_BASE}/tasks${buildQuery(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedTasks>(res);
  },

  /**
   * Get Task by ID
   * Retrieves full details for a single task resource.
   */
  get: async (id: string): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Task>(res);
  },

  /**
   * Create Task
   * Provision a new task record with the provided payload.
   */
  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  /**
   * Update Task
   * Modifies an existing task record. Supports partial updates via payload.
   */
  update: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method:  'PUT',
      headers: getAuthHeaders(),
      body:    JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  /**
   * Delete Task
   * Permanently removes a task record from the system.
   */
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method:  'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },
};