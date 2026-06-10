import { useCallback, useEffect, useState } from 'react'
import * as db from '@/lib/localDb'
import { logDevError } from '@/lib/utils'
import type { Message } from '@/types/chat.types'

/** Loads and updates the message transcript for a single chat. */
export function useMessages(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setMessages(chatId ? db.getMessages(chatId) : [])
      setError(null)
    } catch (refreshError) {
      logDevError(refreshError)
      setError('Unable to load messages.')
    } finally {
      setLoading(false)
    }
  }, [chatId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (message: Message) => {
      try {
        const next = db.addMessage(message)
        await refresh()
        return next
      } catch (addError) {
        logDevError(addError)
        setError('Unable to save message.')
        throw addError
      }
    },
    [refresh]
  )

  const update = useCallback(
    async (message: Message) => {
      try {
        const next = db.updateMessage(message)
        await refresh()
        return next
      } catch (updateError) {
        logDevError(updateError)
        setError('Unable to update message.')
        throw updateError
      }
    },
    [refresh]
  )

  const remove = useCallback(
    async (messageId: string) => {
      try {
        db.deleteMessage(messageId)
        await refresh()
      } catch (removeError) {
        logDevError(removeError)
        setError('Unable to delete message.')
      }
    },
    [refresh]
  )

  return { messages, loading, error, refresh, add, update, remove, setMessages }
}
