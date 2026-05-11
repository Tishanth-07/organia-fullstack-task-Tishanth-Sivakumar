/**
 * @file RegisterForm.test.tsx
 * @description Unit tests for the RegisterForm component.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { toast } from "sonner";

const mockPush = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all registration fields", () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText(/^Jane$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Doe$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane@company.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
  });

  test("shows validation errors for empty submission", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Create account/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  test("shows password strength meter when typing", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();
    // Using a more reliable way to find password input
    const pwInput = screen.getByPlaceholderText(/Min 8 chars/i);
    await user.type(pwInput, "Weak");
    expect(screen.getByText(/Weak/i)).toBeInTheDocument();
  });

  test("shows error message when registration fails", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Email already exists" }),
    });

    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/^Jane$/i), "Alice");
    await user.type(screen.getByPlaceholderText(/^Doe$/i), "Test");
    await user.type(screen.getByPlaceholderText(/jane@company.com/i), "alice@test.com");
    await user.type(screen.getByPlaceholderText(/Min 8 chars/i), "StrongPass123!");
    await user.type(screen.getByPlaceholderText(/Re-enter password/i), "StrongPass123!");
    
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already exists");
    });
  });

  test("navigates to verify-email on successful registration", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" }),
    });

    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/^Jane$/i), "Alice");
    await user.type(screen.getByPlaceholderText(/^Doe$/i), "Test");
    await user.type(screen.getByPlaceholderText(/jane@company.com/i), "alice@test.com");
    await user.type(screen.getByPlaceholderText(/Min 8 chars/i), "StrongPass123!");
    await user.type(screen.getByPlaceholderText(/Re-enter password/i), "StrongPass123!");
    
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/auth/verify-email"));
    });
  });
});
