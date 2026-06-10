import { useCallback, useState } from 'react'
import { streamChatResponse } from '@/lib/api'
import { logDevError } from '@/lib/utils'
import type { AIChatRequest, AIChatResponse } from '@/types/ai.types'

/** Provides a small stateful wrapper around the AI streaming API. */
export function useAI(token?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (input: AIChatRequest, onToken: (token: string) => void): Promise<AIChatResponse> => {
      try {
        setLoading(true)
        setError(null)
        return await streamChatResponse(input, token, onToken)
      } catch (runError) {
        logDevError(runError)
        setError('Unable to complete AI request.')
        throw runError
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  return { run, loading, error }
}
