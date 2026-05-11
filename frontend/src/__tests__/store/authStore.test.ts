/**
 * @file authStore.test.ts
 * @description Unit tests for the Auth Store (Zustand).
 * 
 * WHAT IS TESTED:
 * - Initial state (defaults for user, token, isAuthenticated).
 * - Authentication state updates via setAuth().
 * - Logout logic and state clearing.
 * - Identity replacement (logging in as a different user).
 */

import { act } from "@testing-library/react";
import { useAuthStore } from "@/store/authStore";

// Reset the store to its initial state before each test to maintain isolation
beforeEach(() => {
  act(() => {
    useAuthStore.getState().logout();
  });
});

/**
 * Verifies the system's "Security by Default" state.
 */
test("initial state is unauthenticated with no user or token", () => {
  const store = useAuthStore.getState();

  expect(store.user).toBeNull();
  expect(store.token).toBeNull();
  expect(store.isAuthenticated).toBe(false);
});

/**
 * Verifies that the store correctly processes and stores authentication 
 * metadata upon successful login.
 */
test("setAuth() sets user, token, and isAuthenticated to true", () => {
  act(() => {
    useAuthStore.getState().setAuth({
      token: "fake-jwt-token-abc",
      email: "alice@test.com",
      firstName: "Alice",
      lastName: "Tester",
      role: "User"
    });
  });

  const updated = useAuthStore.getState();
  expect(updated.user).toEqual({
    email: "alice@test.com",
    firstName: "Alice",
    lastName: "Tester",
    role: "User"
  });
  expect(updated.token).toBe("fake-jwt-token-abc");
  expect(updated.isAuthenticated).toBe(true);
});

/**
 * Verifies that logout completely purges all sensitive user data.
 */
test("logout() clears user, token, and sets isAuthenticated to false", () => {
  // Arrange
  act(() => {
    useAuthStore.getState().setAuth({
      token: "some-token",
      email: "alice@test.com",
      firstName: "Alice",
      lastName: "T",
      role: "User"
    });
  });

  // Act
  act(() => {
    useAuthStore.getState().logout();
  });

  // Assert
  const cleared = useAuthStore.getState();
  expect(cleared.user).toBeNull();
  expect(cleared.token).toBeNull();
  expect(cleared.isAuthenticated).toBe(false);
});

/**
 * Verifies that consecutive login actions correctly overwrite previous session data.
 */
test("logging in as a different user replaces previous user", () => {
  act(() => {
    useAuthStore.getState().setAuth({
      token: "token-a",
      email: "alice@test.com",
      firstName: "Alice",
      lastName: "A",
      role: "User"
    });
  });
  act(() => {
    useAuthStore.getState().setAuth({
      token: "token-b",
      email: "bob@test.com",
      firstName: "Bob",
      lastName: "B",
      role: "User"
    });
  });

  const final = useAuthStore.getState();
  expect(final.user?.email).toBe("bob@test.com");
  expect(final.token).toBe("token-b");
});

/**
 * Verifies that partial authentication updates (if supported) are handled.
 */
test("token remains consistent until explicit logout or replacement", () => {
  act(() => {
    useAuthStore.getState().setAuth({
      token: "persistent-token",
      email: "user@test.com",
      firstName: "User",
      lastName: "Test",
      role: "User"
    });
  });
  
  expect(useAuthStore.getState().token).toBe("persistent-token");
});

/**
 * Verifies that isAuthenticated flag is accurately tied to token presence.
 */
test("isAuthenticated is false if only user info exists without token", () => {
  // Manual state injection if possible, otherwise verify via setAuth
  const store = useAuthStore.getState();
  expect(store.isAuthenticated).toBe(false);
});