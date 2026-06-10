import type { ChatMode } from './chat.types'

export type ThemePreference = 'dark' | 'light' | 'system'

export interface UserSettings {
  theme: ThemePreference
  defaultMode: ChatMode
  language: string
  notifications: boolean
}
