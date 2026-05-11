import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthResponse } from '@/types/auth'

/**
 * Shape of the user object stored in the auth state.
 */
interface AuthUser {
  email: string
  firstName: string
  lastName: string
  role: string
}

/**
 * Zustand store state for managing user authentication and identity.
 */
interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  
  /** Stores authentication data and sets the session cookie */
  setAuth: (data: AuthResponse) => void
  /** Clears authentication data and removes the session cookie */
  logout: () => void
}

/**
 * Hook for accessing the authentication store.
 * Persists data to localStorage automatically.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (data: any) => {
        // Handle both camelCase and PascalCase from backend
        const token = data.token || data.Token
        if (!token) return

        // Securely set the session cookie for middleware access (7-day expiry)
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        
        set({
          token: token,
          user: {
            email:     data.email     || data.Email,
            firstName: data.firstName || data.FirstName,
            lastName:  data.lastName  || data.LastName,
            role:      data.role      || data.Role,
          },
          isAuthenticated: true,
        })
      },

      logout: () => {
        // Remove the session cookie by setting its expiry to the past
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage', // Key used in localStorage
    }
  )
)