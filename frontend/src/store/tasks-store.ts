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

// ── State shape ───────────────────────────────────────────────────────────────

interface TasksState {
  // Data
  pagedTasks:  PagedTasks | null;
  tasks:       Task[];
  isLoading:   boolean;
  error:       string | null;

  // Filters / sort / pagination
  query: TaskQuery;

  // Modal state
  editingTask:   Task | null;
  deletingTaskId: string | null;
  isModalOpen:   boolean;

  // Actions
  fetchTasks:   (q?: Partial<TaskQuery>) => Promise<void>;
  createTask:   (payload: CreateTaskPayload) => Promise<Task>;
  updateTask:   (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask:   (id: string) => Promise<void>;
  quickStatus:  (id: string, status: TaskStatus) => Promise<void>;

  setQuery:       (q: Partial<TaskQuery>) => void;
  openCreate:     () => void;
  openEdit:       (task: Task) => void;
  closeModal:     () => void;
  setDeletingId:  (id: string | null) => void;
  clearError:     () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useTasksStore = create<TasksState>((set, get) => ({
  pagedTasks:     null,
  tasks:          [],
  isLoading:      false,
  error:          null,
  query:          { page: 1, pageSize: 9, sortBy: 'createdAt', sortOrder: 'desc' },
  editingTask:    null,
  deletingTaskId: null,
  isModalOpen:    false,

  // ── Fetch ─────────────────────────────────────────────────────────────────

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

  // ── Create ────────────────────────────────────────────────────────────────

  createTask: async (payload) => {
    const task = await tasksApi.create(payload);
    await get().fetchTasks({ page: 1 });
    return task;
  },

  // ── Update ────────────────────────────────────────────────────────────────

  updateTask: async (id, payload) => {
    const task = await tasksApi.update(id, payload);
    // Optimistic update in list
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? task : t)),
    }));
    await get().fetchTasks();
    return task;
  },

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteTask: async (id) => {
    await tasksApi.delete(id);
    set((s) => ({
      tasks:          s.tasks.filter((t) => t.id !== id),
      deletingTaskId: null,
    }));
    await get().fetchTasks();
  },

  // ── Quick status toggle ───────────────────────────────────────────────────

  quickStatus: async (id, status) => {
    // Optimistic
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    try {
      await tasksApi.update(id, { status });
      await get().fetchTasks();
    } catch (e: unknown) {
      set({ error: (e as Error).message });
      await get().fetchTasks(); // revert
    }
  },

  // ── UI helpers ────────────────────────────────────────────────────────────

  setQuery:       (q) => { set((s) => ({ query: { ...s.query, ...q } })); },
  openCreate:     () => set({ isModalOpen: true, editingTask: null }),
  openEdit:       (task) => set({ isModalOpen: true, editingTask: task }),
  closeModal:     () => set({ isModalOpen: false, editingTask: null }),
  setDeletingId:  (id) => set({ deletingTaskId: id }),
  clearError:     () => set({ error: null }),
}));