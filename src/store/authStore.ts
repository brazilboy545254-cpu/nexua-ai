import { create } from 'zustand'
import type { AuthUser } from '@/types/auth.types'

interface AuthStore {
  user: AuthUser | null
  loading: boolean
  error: string | null
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signOutLocal: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  signOutLocal: () => set({ user: null, error: null, loading: false })
}))
