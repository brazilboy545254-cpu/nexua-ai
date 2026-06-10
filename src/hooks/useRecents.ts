import { useCallback, useEffect, useState } from 'react'
import * as db from '@/lib/localDb'
import { logDevError } from '@/lib/utils'
import type { ActivityItem } from '@/types/project.types'

/** Provides the merged recent chats and projects feed. */
export function useRecents(userId?: string) {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setItems(userId ? db.getActivity(userId) : [])
    } catch (error) {
      logDevError(error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, refresh }
}
