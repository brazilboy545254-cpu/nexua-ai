import { useCallback, useEffect, useState } from 'react'
import * as db from '@/lib/localDb'
import { logDevError } from '@/lib/utils'
import type { Chat, CreateChatInput } from '@/types/chat.types'

/** Loads and mutates chats through the local repository used by the dev UI. */
export function useChats(userId?: string) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setChats(userId ? db.getChats(userId) : [])
      setError(null)
    } catch (refreshError) {
      logDevError(refreshError)
      setError('Unable to load chats.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: CreateChatInput) => {
      try {
        if (!userId) throw new Error('Missing user')
        const chat = db.createChat(userId, input)
        await refresh()
        return chat
      } catch (createError) {
        logDevError(createError)
        setError('Unable to create chat.')
        throw createError
      }
    },
    [refresh, userId]
  )

  const rename = useCallback(
    async (chatId: string, title: string) => {
      try {
        const chat = db.renameChat(chatId, title)
        await refresh()
        return chat
      } catch (renameError) {
        logDevError(renameError)
        setError('Unable to rename chat.')
        return null
      }
    },
    [refresh]
  )

  const remove = useCallback(
    async (chatId: string) => {
      try {
        db.deleteChat(chatId)
        await refresh()
      } catch (deleteError) {
        logDevError(deleteError)
        setError('Unable to delete chat.')
      }
    },
    [refresh]
  )

  return { chats, loading, error, refresh, create, rename, remove }
}
