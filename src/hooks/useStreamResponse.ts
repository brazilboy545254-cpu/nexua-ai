import { useCallback, useState } from 'react'

/** Accumulates streamed tokens for components that need lightweight streaming state. */
export function useStreamResponse() {
  const [content, setContent] = useState('')

  const append = useCallback((token: string) => {
    setContent((current) => `${current}${token}`)
  }, [])

  const reset = useCallback(() => {
    setContent('')
  }, [])

  return { content, append, reset }
}
