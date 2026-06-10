import { MessageSquare } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import type { Message } from '@/types/chat.types'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'

interface ChatWindowProps {
  messages: Message[]
  streaming: boolean
  onRetry: (message: Message) => void
  onDelete: (messageId: string) => void
}

export function ChatWindow({ messages, streaming, onRetry, onDelete }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, streaming])

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Start a new conversation"
        description="Ask for research, code, planning, comparisons, or a concise answer."
        className="h-full"
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRetry={message.role === 'assistant' ? () => onRetry(message) : undefined}
          onDelete={() => onDelete(message.id)}
        />
      ))}
      {streaming ? <TypingIndicator /> : null}
      <div ref={bottomRef} />
    </div>
  )
}
