/**
 * @file TaskCard.test.tsx
 * @description Unit tests for the TaskCard component.
 * 
 * WHAT IS TESTED:
 * - Content rendering (Title, Description, Status badges).
 * - Date formatting and Overdue indicators.
 * - Interactive actions (Edit/Delete) and their integration with the Task Store.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TaskCard from "@/components/tasks/TaskCard";
import type { Task } from "@/types/task";
import { useTasksStore } from '@/store/tasks-store';

// Mock the tasks store to verify interaction with state management
jest.mock('@/store/tasks-store', () => ({
  useTasksStore: jest.fn(),
}));

/**
 * Shared factory function to create mock task objects for testing.
 */
const mockTask = (overrides: Partial<Task> = {}): Task => ({
  id         : "fake-id-123",
  title      : "Sample task",
  description: "A description",
  status     : "ToDo",
  dueDate    : new Date("2026-12-31").toISOString(),
  createdAt  : new Date().toISOString(),
  updatedAt  : new Date().toISOString(),
  isOverdue  : false,
  ...overrides,
});

/**
 * Mock implementation of the task store hooks.
 */
const mockStore = {
  openEdit: jest.fn(),
  setDeletingId: jest.fn(),
  quickStatus: jest.fn(),
};

beforeEach(() => {
  (useTasksStore as unknown as jest.Mock).mockReturnValue(mockStore);
  jest.clearAllMocks();
});

/**
 * Verifies basic information display.
 */
test("renders task title and description", () => {
  render(<TaskCard task={mockTask()} />);

  expect(screen.getByText("Sample task")).toBeInTheDocument();
  expect(screen.getByText("A description")).toBeInTheDocument();
});

/**
 * Verifies that the correct status badge is displayed for different task states.
 */
describe("Status Badge Rendering", () => {
  test("renders correct status badge for ToDo task", () => {
    render(<TaskCard task={mockTask({ status: "ToDo" })} />);
    expect(screen.getByText(/to do/i)).toBeInTheDocument();
  });

  test("renders correct status badge for InProgress task", () => {
    render(<TaskCard task={mockTask({ status: "InProgress" })} />);
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
  });

  test("renders correct status badge for Completed task", () => {
    render(<TaskCard task={mockTask({ status: "Completed" })} />);
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });
});

/**
 * Verifies that the due date is presented in a human-readable format.
 */
test("renders due date in a readable format", () => {
  render(<TaskCard task={mockTask({ dueDate: "2026-12-31T00:00:00Z" })} />);
  expect(screen.getByText(/2026/)).toBeInTheDocument();
});

/**
 * Verifies that clicking the Edit button triggers the correct store action.
 */
test("calls openEdit with the task when Edit button is clicked", () => {
  const task = mockTask();
  render(<TaskCard task={task} />);
  
  fireEvent.click(screen.getByRole("button", { name: /^edit task$/i }));

  expect(mockStore.openEdit).toHaveBeenCalledWith(task);
});

/**
 * Verifies that clicking the Delete button triggers the deletion flow in the store.
 */
test("calls setDeletingId with task id when Delete button is clicked", () => {
  const task = mockTask({ id: "id-42" });
  render(<TaskCard task={task} />);
  
  fireEvent.click(screen.getByRole("button", { name: /^delete task$/i }));

  expect(mockStore.setDeletingId).toHaveBeenCalledWith("id-42");
});

/**
 * Verifies that overdue tasks display a high-visibility overdue indicator.
 */
test("shows overdue indicator for tasks flagged as overdue", () => {
  render(<TaskCard task={mockTask({ isOverdue: true, status: "ToDo" })} />);
  expect(screen.getByText(/overdue/i)).toBeInTheDocument();
});