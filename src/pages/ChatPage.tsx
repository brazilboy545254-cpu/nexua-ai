import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { routes } from '@/config/routes'
import { streamChatResponse } from '@/lib/api'
import * as db from '@/lib/localDb'
import { createId, logDevError, truncate } from '@/lib/utils'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { AIMessage } from '@/types/ai.types'
import type { Chat, ChatAttachment, ChatMode, Message } from '@/types/chat.types'

function titleFromMessage(message: string) {
  return truncate(message.replace(/\s+/g, ' ').trim(), 56) || 'New Chat'
}

export default function ChatPage() {
  usePageMeta('Chat')
  const navigate = useNavigate()
  const { chatId: paramChatId } = useParams()
  const user = useAuthStore((state) => state.user)
  const defaultMode = useSettingsStore((state) => state.defaultMode)
  const { activeMode, setActiveChatId, setActiveMode } = useChatStore()
  const [chatId, setChatId] = useState<string | undefined>(paramChatId)
  const [chat, setChat] = useState<Chat | null>(paramChatId ? db.getChat(paramChatId) : null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const mode = chat?.mode ?? activeMode ?? defaultMode

  useEffect(() => {
    setChatId(paramChatId)
    const nextChat = paramChatId ? db.getChat(paramChatId) : null
    setChat(nextChat)
    setMessages(paramChatId ? db.getMessages(paramChatId) : [])
    setActiveChatId(paramChatId ?? null)
    if (nextChat) setActiveMode(nextChat.mode)
  }, [paramChatId, setActiveChatId, setActiveMode])

  const history = useMemo<AIMessage[]>(
    () =>
      messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({ role: message.role, content: message.content })),
    [messages]
  )

  async function ensureChat(content: string, nextMode: ChatMode) {
    if (!user) throw new Error('Missing user')
    if (chat) return chat
    const created = db.createChat(user.id, { title: titleFromMessage(content), mode: nextMode })
    setChat(created)
    setChatId(created.id)
    setActiveChatId(created.id)
    navigate(routes.chat(created.id), { replace: true })
    return created
  }

  function setTranscript(chatIdentifier: string) {
    setMessages(db.getMessages(chatIdentifier))
  }

  async function sendMessage(content: string, attachment?: ChatAttachment) {
    if (!user) return
    try {
      setStreaming(true)
      const targetChat = await ensureChat(content, mode)
      const userMessage: Message = {
        id: createId('msg'),
        chatId: targetChat.id,
        userId: user.id,
        role: 'user',
        content,
        metadata: attachment
          ? {
              attachmentName: attachment.name,
              attachmentPreview: truncate(attachment.text, 500)
            }
          : undefined,
        createdAt: new Date().toISOString()
      }
      db.addMessage(userMessage)

      const assistantMessage: Message = {
        id: createId('msg'),
        chatId: targetChat.id,
        userId: user.id,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      }
      db.addMessage(assistantMessage)
      setTranscript(targetChat.id)

      let streamed = ''
      const response = await streamChatResponse(
        {
          chatId: targetChat.id,
          projectId: targetChat.projectId,
          mode,
          message: content,
          history,
          attachmentContext: attachment?.text
        },
        user.token,
        (token) => {
          streamed += token
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id ? { ...message, content: streamed } : message
            )
          )
        }
      )

      db.updateMessage({
        ...assistantMessage,
        content: response.content,
        provider: response.provider,
        model: response.model,
        metadata: {
          citations: response.citations,
          steps: response.steps
        }
      })
      setTranscript(targetChat.id)
    } catch (error) {
      logDevError(error)
      toast.error('Unable to send message.')
    } finally {
      setStreaming(false)
    }
  }

  function changeMode(nextMode: ChatMode) {
    setActiveMode(nextMode)
    if (chat) {
      const updated = db.upsertChat({ ...chat, mode: nextMode, updatedAt: new Date().toISOString() })
      setChat(updated)
    }
  }

  function deleteCurrentChat() {
    if (!chatId) return
    db.deleteChat(chatId)
    navigate(routes.chatNew, { replace: true })
  }

  function retryFrom(message: Message) {
    const index = messages.findIndex((item) => item.id === message.id)
    const previousUser = messages
      .slice(0, index)
      .reverse()
      .find((item) => item.role === 'user')
    if (previousUser) {
      void sendMessage(previousUser.content)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ChatHeader
        chat={chat}
        mode={mode}
        messages={messages}
        onModeChange={changeMode}
        onDeleteChat={chat ? () => setDeleteOpen(true) : undefined}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatWindow
          messages={messages}
          streaming={streaming}
          onRetry={retryFrom}
          onDelete={(messageId) => {
            db.deleteMessage(messageId)
            if (chatId) setTranscript(chatId)
          }}
        />
      </div>
      <ChatInput disabled={streaming} onSubmit={sendMessage} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete chat?"
        description="This removes the local transcript for this chat."
        confirmLabel="Delete"
        onConfirm={deleteCurrentChat}
      />
    </div>
  )
}
