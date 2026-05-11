import type {
  CreateTaskPayload,
  PagedTasks,
  Task,
  TaskQuery,
  UpdateTaskPayload,
} from '@/types/task';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5181/api';

// ── Auth token helper ─────────────────────────────────────────────────────────

// Helper to get cookie on client side
function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

function getAuthHeaders(): HeadersInit {
  const token = getCookie('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Response handler ──────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Build query string ────────────────────────────────────────────────────────

function buildQuery(params: TaskQuery): string {
  const q = new URLSearchParams();
  if (params.status)    q.set('status',    params.status);
  if (params.search)    q.set('search',    params.search);
  if (params.sortBy)    q.set('sortBy',    params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  if (params.page)      q.set('page',      String(params.page));
  if (params.pageSize)  q.set('pageSize',  String(params.pageSize));
  return q.toString() ? `?${q.toString()}` : '';
}

// ── API functions ─────────────────────────────────────────────────────────────

export const tasksApi = {
  /** GET /api/tasks — paginated, filtered, sorted */
  list: async (query: TaskQuery = {}): Promise<PagedTasks> => {
    const res = await fetch(`${API_BASE}/tasks${buildQuery(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedTasks>(res);
  },

  /** GET /api/tasks/:id */
  get: async (id: string): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Task>(res);
  },

  /** POST /api/tasks */
  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  /** PUT /api/tasks/:id */
  update: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method:  'PUT',
      headers: getAuthHeaders(),
      body:    JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  /** DELETE /api/tasks/:id */
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method:  'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },
};