import type { ChatMode, MessageRole, AIProvider } from './chat.types'
import type { Citation, ResearchStep } from './research.types'

export interface AIMessage {
  role: MessageRole
  content: string
}

export interface AIModelRoute {
  provider: AIProvider
  model: string
  modes: ChatMode[]
  priority: number
  maxInputChars: number
}

export interface AIChatRequest {
  chatId?: string
  projectId?: string | null
  mode: ChatMode
  message: string
  history: AIMessage[]
  attachmentContext?: string
}

export interface AIChatResponse {
  content: string
  provider: AIProvider
  model: string
  citations?: Citation[]
  steps?: ResearchStep[]
}

export interface AIStreamChunk {
  token?: string
  done?: boolean
  response?: AIChatResponse
  error?: string
}

export interface TypedErrorResponse {
  error: string
  code: string
}
