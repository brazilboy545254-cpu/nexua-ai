import type { Citation, ResearchStep } from './research.types'

export type ChatMode = 'chat' | 'research' | 'deep_research' | 'code'
export type MessageRole = 'user' | 'assistant' | 'system'
export type AIProvider = 'mistral' | 'gemini' | 'groq' | 'local'

export interface Chat {
  id: string
  userId: string
  projectId: string | null
  title: string
  mode: ChatMode
  createdAt: string
  updatedAt: string
}

export interface MessageMetadata extends Record<string, unknown> {
  citations?: Citation[]
  steps?: ResearchStep[]
  attachmentName?: string
  attachmentPreview?: string
}

export interface Message {
  id: string
  chatId: string
  userId: string
  role: MessageRole
  content: string
  provider?: AIProvider
  model?: string
  tokensUsed?: number
  metadata?: MessageMetadata
  createdAt: string
}

export interface ChatAttachment {
  name: string
  mimeType: string
  text: string
}

export interface CreateChatInput {
  title?: string
  mode: ChatMode
  projectId?: string | null
}
