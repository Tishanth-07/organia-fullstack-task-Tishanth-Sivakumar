/**
 * @file LoginForm.test.tsx
 * @description Unit tests for the LoginForm component.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/LoginForm";
import { toast } from "sonner";

const mockPush = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders email input, password input, and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/you@company.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  test("shows validation errors when submitted with empty fields", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  test("shows error message when login fails", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Invalid credentials" }),
    });

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/you@company.com/i), "test@test.com");
    await user.type(screen.getByPlaceholderText(/Your password/i), "Pass123!");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  test("navigates to dashboard on successful login", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "fake-jwt", email: "test@test.com" }),
    });

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/you@company.com/i), "test@test.com");
    await user.type(screen.getByPlaceholderText(/Your password/i), "Pass123!");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("disables submit button while loading", async () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/you@company.com/i), "test@test.com");
    await user.type(screen.getByPlaceholderText(/Your password/i), "Pass123!");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));
    expect(screen.getByRole("button", { name: /Signing in/i })).toBeDisabled();
  });
});