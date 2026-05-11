/**
 * @file jest.setup.ts
 * @description Global test setup and environment configuration.
 * 
 * This file runs before every test suite and is responsible for:
 * - Extending Jest with Testing Library matchers (toBeInTheDocument, etc.).
 * - Defining global mocks for standard browser APIs (fetch, Router).
 * - Managing console output noise during testing.
 */

import "@testing-library/jest-dom";

/**
 * Mocking Next.js Navigation
 * Components using useRouter, usePathname, etc., will use this stable mock.
 */
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push    : jest.fn(),
    replace : jest.fn(),
    back    : jest.fn(),
    prefetch: jest.fn(),
    pathname: "/",
  }),
  usePathname : jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect    : jest.fn(),
}));

/**
 * Mocking Sonner Toaster
 * Allows tracking of toast notifications without rendering the DOM components.
 */
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

/**
 * Global API Mocking
 * Ensures that tests do not accidentally trigger real network requests.
 * Individual tests should override this with specific mock implementations.
 */
global.fetch = jest.fn();

/**
 * Console Management
 * Suppresses console.error during tests to keep output clean from 
 * intentional validation errors and prop-type warnings.
 */
const originalConsoleError = console.error;

beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  // Clean up all mock call histories between test files
  jest.clearAllMocks();
});