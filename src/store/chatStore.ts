import { create } from 'zustand'
import type { ChatMode } from '@/types/chat.types'

interface ChatStore {
  activeChatId: string | null
  activeMode: ChatMode
  setActiveChatId: (chatId: string | null) => void
  setActiveMode: (mode: ChatMode) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  activeChatId: null,
  activeMode: 'chat',
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setActiveMode: (activeMode) => set({ activeMode })
}))
