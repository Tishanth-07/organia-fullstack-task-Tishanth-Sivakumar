/**
 * @file tasksStore.test.ts
 * @description Unit tests for the Task Store (Zustand).
 * 
 * WHAT IS TESTED:
 * - Initial state (empty lists, loading status).
 * - Async task fetching (Success/Failure states).
 * - CRUD operation integration (Create, Update, Delete).
 * - Loading indicators during async operations.
 */

import { act } from "@testing-library/react";
import { useTasksStore } from "@/store/tasks-store";

/**
 * Shared factory function to create mock task entities.
 */
const mockTask = (id: string) => ({
  id,
  title      : `Task ${id}`,
  description: `Description ${id}`,
  status     : "ToDo" as const,
  dueDate    : new Date("2026-12-31").toISOString(),
  createdAt  : new Date().toISOString(),
  updatedAt  : new Date().toISOString(),
  isOverdue  : false,
});

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Verifies that the store starts in a predictable, clean state.
 */
test("initial state has empty tasks array and not loading", () => {
  const store = useTasksStore.getState();

  expect(store.tasks).toEqual([]);
  expect(store.isLoading).toBe(false);
  expect(store.error).toBeNull();
});

/**
 * Verifies task fetching.
 */
test("fetchTasks() loads tasks from API and stores them", async () => {
  const apiResponse = {
    items: [mockTask("1"), mockTask("2")],
    totalCount: 2,
    page: 1,
    pageSize: 9,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    toDoCount: 2,
    inProgressCount: 0,
    completedCount: 0,
    overdueCount: 0
  };

  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok  : true,
    json: async () => apiResponse,
  });

  await act(async () => {
    await useTasksStore.getState().fetchTasks();
  });

  const store = useTasksStore.getState();
  expect(store.tasks).toHaveLength(2);
});

/**
 * Verifies error handling.
 */
test("fetchTasks() sets error state on API failure", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok    : false,
    status: 500,
    json  : async () => ({ message: "Server error" }),
  });

  await act(async () => {
    await useTasksStore.getState().fetchTasks();
  });

  expect(useTasksStore.getState().error).toBe("Server error");
});

/**
 * Verifies loading state tracking.
 */
test("isLoading is true during fetchTasks and false after", async () => {
  let resolvePromise!: (value: any) => void;
  const neverResolves = new Promise(resolve => { resolvePromise = resolve; });

  (global.fetch as jest.Mock).mockReturnValueOnce(neverResolves);

  let fetchPromise: Promise<void>;
  act(() => {
    fetchPromise = useTasksStore.getState().fetchTasks();
  });

  expect(useTasksStore.getState().isLoading).toBe(true);

  await act(async () => {
    resolvePromise({ ok: true, json: async () => ({ items: [], totalCount: 0 }) });
    await fetchPromise!;
  });

  expect(useTasksStore.getState().isLoading).toBe(false);
});

/**
 * Verifies task deletion.
 */
test("deleteTask() calls API and refreshes list", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 });
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ items: [], totalCount: 0 }) });

  await act(async () => {
    await useTasksStore.getState().deleteTask("id-123");
  });

  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/tasks/id-123"), expect.objectContaining({ method: "DELETE" }));
});

/**
 * Verifies task creation.
 */
test("createTask() calls API and refreshes list", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockTask("new") });
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ items: [], totalCount: 0 }) });

  await act(async () => {
    await useTasksStore.getState().createTask({ title: "New", status: "ToDo" });
  });

  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/tasks"), expect.objectContaining({ method: "POST" }));
});

/**
 * Verifies task updates.
 */
test("updateTask() calls API and refreshes list", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockTask("42") });
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ items: [], totalCount: 0 }) });

  await act(async () => {
    await useTasksStore.getState().updateTask("42", { title: "Updated" });
  });

  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/tasks/42"), expect.objectContaining({ method: "PUT" }));
});