import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthResponse } from '@/types/auth'

interface AuthState {
  token: string | null
  user: {
    email: string
    firstName: string
    lastName: string
    role: string
  } | null
  isAuthenticated: boolean
  
  setAuth: (data: AuthResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (data) => {
        // Set cookie for middleware (7 days)
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        
        set({
          token: data.token,
          user: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          },
          isAuthenticated: true,
        })
      },

      logout: () => {
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)