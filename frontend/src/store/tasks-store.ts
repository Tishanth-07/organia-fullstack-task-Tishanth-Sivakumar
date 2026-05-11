import { create } from 'zustand';
import { tasksApi } from '@/lib/tasks-api';
import type {
  CreateTaskPayload,
  PagedTasks,
  Task,
  TaskQuery,
  TaskStatus,
  UpdateTaskPayload,
} from '@/types/task';

/**
 * State and actions for managing the application's task collection.
 * Includes pagination, filtering, and CRUD operations.
 */
interface TasksState {
  // Data State
  pagedTasks:  PagedTasks | null;
  tasks:       Task[];
  isLoading:   boolean;
  error:       string | null;

  // Search & Pagination Parameters
  query: TaskQuery;

  // UI / Modal State
  editingTask:   Task | null;
  deletingTaskId: string | null;
  isModalOpen:   boolean;

  // Core Actions
  /** Fetches a paged list of tasks from the API */
  fetchTasks:   (q?: Partial<TaskQuery>) => Promise<void>;
  /** Creates a new task and refreshes the current list */
  createTask:   (payload: CreateTaskPayload) => Promise<Task>;
  /** Updates an existing task with optimistic UI updates */
  updateTask:   (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  /** Deletes a task by ID */
  deleteTask:   (id: string) => Promise<void>;
  /** Rapidly updates a task's status (e.g., from a checkbox) */
  quickStatus:  (id: string, status: TaskStatus) => Promise<void>;

  // UI / Helper Actions
  setQuery:       (q: Partial<TaskQuery>) => void;
  openCreate:     () => void;
  openEdit:       (task: Task) => void;
  closeModal:     () => void;
  setDeletingId:  (id: string | null) => void;
  clearError:     () => void;
}

/**
 * Main store for managing tasks across the dashboard.
 */
export const useTasksStore = create<TasksState>((set, get) => ({
  pagedTasks:     null,
  tasks:          [],
  isLoading:      false,
  error:          null,
  query:          { page: 1, pageSize: 9, sortBy: 'createdAt', sortOrder: 'desc' },
  editingTask:    null,
  deletingTaskId: null,
  isModalOpen:    false,

  // ── Fetch Operations ──────────────────────────────────────────────────────
  
  fetchTasks: async (partial = {}) => {
    const newQuery = { ...get().query, ...partial };
    set({ isLoading: true, error: null, query: newQuery });
    try {
      const data = await tasksApi.list(newQuery);
      set({ pagedTasks: data, tasks: data.items, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  // ── Persistence Operations ────────────────────────────────────────────────
  
  createTask: async (payload) => {
    const task = await tasksApi.create(payload);
    // Reset to first page to see the new task (sorted by desc)
    await get().fetchTasks({ page: 1 });
    return task;
  },

  updateTask: async (id, payload) => {
    const task = await tasksApi.update(id, payload);
    
    // Perform optimistic update to keep UI snappy
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? task : t)),
    }));
    
    await get().fetchTasks();
    return task;
  },

  deleteTask: async (id) => {
    await tasksApi.delete(id);
    
    // Instantly remove from local state
    set((s) => ({
      tasks:          s.tasks.filter((t) => t.id !== id),
      deletingTaskId: null,
    }));
    
    await get().fetchTasks();
  },

  quickStatus: async (id, status) => {
    // Optimistically update the status icon/text
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    
    try {
      await tasksApi.update(id, { status });
      await get().fetchTasks();
    } catch (e: unknown) {
      // Revert or show error on failure
      set({ error: (e as Error).message });
      await get().fetchTasks();
    }
  },

  // ── UI Control Actions ────────────────────────────────────────────────────
  
  setQuery:       (q) => set((s) => ({ query: { ...s.query, ...q } })),
  openCreate:     () => set({ isModalOpen: true, editingTask: null }),
  openEdit:       (task) => set({ isModalOpen: true, editingTask: task }),
  closeModal:     () => set({ isModalOpen: false, editingTask: null }),
  setDeletingId:  (id) => set({ deletingTaskId: id }),
  clearError:     () => set({ error: null }),
}));