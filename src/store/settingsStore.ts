import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/types/settings.types'
import type { ChatMode } from '@/types/chat.types'

interface SettingsStore extends UserSettings {
  setTheme: (theme: UserSettings['theme']) => void
  setDefaultMode: (mode: ChatMode) => void
  setNotifications: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      defaultMode: 'chat',
      language: 'en',
      notifications: true,
      setTheme: (theme) => set({ theme }),
      setDefaultMode: (defaultMode) => set({ defaultMode }),
      setNotifications: (notifications) => set({ notifications })
    }),
    {
      name: 'nexua:v1:settings-store'
    }
  )
)
