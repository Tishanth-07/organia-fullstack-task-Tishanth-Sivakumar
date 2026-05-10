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
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        })
        localStorage.removeItem('token')
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)