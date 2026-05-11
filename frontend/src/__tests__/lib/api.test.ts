/**
 * @file api.test.ts
 * @description Integration tests for the shared API clients (Auth and Tasks).
 * 
 * WHAT IS TESTED:
 * - Proper URL construction for various API endpoints.
 * - Correct HTTP methods (GET, POST, PUT, DELETE).
 * - Proper header injection (Authorization Bearer token from cookies).
 * - Global error handling and status code rejection logic.
 */

import { authApi } from "@/lib/api";
import { tasksApi } from "@/lib/tasks-api";

// ── AUTH API tests ─────────────────────────────────────────────────────────────

describe("Auth API client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  test("register() sends POST request to correct endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok  : true,
      json: async () => ({ message: "Success" }),
    });

    const data = { firstName: "U", lastName: "T", email: "u@t.com", password: "Pass123!" };
    await authApi.register(data);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({ 
        method: "POST",
        body: JSON.stringify(data)
      })
    );
  });

  test("login() sends POST request to /auth/login", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok  : true,
      json: async () => ({ token: "abc", email: "u@t.com", firstName: "U", lastName: "T" }),
    });

    await authApi.login({ email: "u@t.com", password: "Pass123!" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ method: "POST" })
    );
  });

  test("forgotPassword() sends POST request to correct endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Email sent" }),
    });

    await authApi.forgotPassword({ email: "user@test.com" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/forgot-password"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@test.com" })
      })
    );
  });

  test("login() throws an error on 401 Unauthorized", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok    : false,
      status: 401,
      json  : async () => ({ message: "Invalid credentials" }),
    });

    await expect(
      authApi.login({ email: "u@t.com", password: "wrong" })
    ).rejects.toThrow("Invalid credentials");
  });
});

// ── TASKS API tests ────────────────────────────────────────────────────────────

describe("Tasks API client", () => {
  const FAKE_TOKEN = "fake-jwt";

  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = `token=${FAKE_TOKEN}`;
  });

  test("list() sends GET request with Authorization header", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok  : true,
      json: async () => ({ items: [], totalCount: 0 }),
    });

    await tasksApi.list();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${FAKE_TOKEN}`,
        }),
      })
    );
  });

  test("create() sends POST with correct body and auth header", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok  : true,
      json: async () => ({ id: "1", title: "New task", status: "ToDo" }),
    });

    const taskData = { title: "New task", description: "", status: "ToDo" as const };
    await tasksApi.create(taskData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks"),
      expect.objectContaining({
        method : "POST",
        body   : JSON.stringify(taskData),
        headers: expect.objectContaining({
          Authorization: `Bearer ${FAKE_TOKEN}`,
        }),
      })
    );
  });

  test("update() sends PUT to correct /tasks/:id URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok  : true,
      json: async () => ({ id: "42", title: "Updated", status: "InProgress" }),
    });

    await tasksApi.update("42", { title: "Updated", status: "InProgress" as const });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/42"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  test("delete() sends DELETE to correct /tasks/:id URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok  : true,
      status: 204,
      json: async () => ({}),
    });

    await tasksApi.delete("7");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/7"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  test("throws an error when API returns non-2xx status", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok    : false,
      status: 500,
      json  : async () => ({ message: "Internal Server Error" }),
    });

    await expect(tasksApi.list()).rejects.toThrow("Internal Server Error");
  });
});