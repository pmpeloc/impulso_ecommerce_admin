import { create } from 'zustand'
import { apiPost, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/api'
import type { User, LoginInput, LoginResponse } from '@/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  login: (credentials: LoginInput) => Promise<void>
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,

  login: async (credentials) => {
    const data = await apiPost<LoginResponse>('/api/v1/auth/login', credentials)
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    document.cookie = 'session=1; path=/; SameSite=Lax'
    set({ user: data.user, token: data.token })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    set({ user: null, token: null })
  },

  hydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      set({ token })
    }
  },
}))
