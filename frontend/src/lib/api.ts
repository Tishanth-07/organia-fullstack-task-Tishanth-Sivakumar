import { AuthResponse, MessageResponse } from '@/types/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5181/api'

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data as T
}

// Helper to get cookie on client side
function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

// Authenticated request (attaches JWT from cookie)
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

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiFetch<MessageResponse>('auth/register', { method: 'POST', body: JSON.stringify(data) }),

  verifyEmail: (data: { email: string; code: string }) =>
    apiFetch<MessageResponse>('auth/verify-email', { method: 'POST', body: JSON.stringify(data) }),

  resendVerification: (data: { email: string }) =>
    apiFetch<MessageResponse>('auth/resend-verification', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>('auth/login', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (data: { email: string }) =>
    apiFetch<MessageResponse>('auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    apiFetch<MessageResponse>('auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
}