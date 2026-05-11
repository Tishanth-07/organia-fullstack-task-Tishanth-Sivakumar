import { AuthResponse, MessageResponse } from '@/types/auth'

/**
 * Base URL for the backend API.
 * Pulls from NEXT_PUBLIC_API_URL in .env, with a local fallback.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * A generic wrapper for the native fetch API with built-in JSON parsing and error handling.
 * @param endpoint The API endpoint (e.g., 'auth/login')
 * @param options Standard fetch RequestInit options.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  // Attempt to parse JSON response.
  const data = await res.json().catch(() => ({ message: 'Failed to parse server response' }));

  if (!res.ok) {
    // Throw a professional error message from the backend or a generic fallback.
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

/**
 * Retrieves a cookie value by name from the document.
 */
function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

/**
 * An authenticated wrapper for apiFetch that automatically attaches the JWT token 
 * from cookies to the Authorization header.
 */
export function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getCookie('token')
  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

/**
 * Authentication API module for handling user identity flows.
 */
export const authApi = {
  /** Registers a new user account */
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiFetch<MessageResponse>('auth/register', { method: 'POST', body: JSON.stringify(data) }),

  /** Verifies email using a 6-digit OTP */
  verifyEmail: (data: { email: string; code: string }) =>
    apiFetch<MessageResponse>('auth/verify-email', { method: 'POST', body: JSON.stringify(data) }),

  /** Resends the verification email */
  resendVerification: (data: { email: string }) =>
    apiFetch<MessageResponse>('auth/resend-verification', { method: 'POST', body: JSON.stringify(data) }),

  /** Authenticates user and returns JWT token */
  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>('auth/login', { method: 'POST', body: JSON.stringify(data) }),

  /** Requests a password reset OTP */
  forgotPassword: (data: { email: string }) =>
    apiFetch<MessageResponse>('auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),

  /** Resets password using the OTP and new password */
  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    apiFetch<MessageResponse>('auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
}