import type { AIChatRequest, AIChatResponse, AIStreamChunk, TypedErrorResponse } from '@/types/ai.types'
import type { ChatMode } from '@/types/chat.types'
import { logDevError } from './utils'

export class ApiError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

interface ApiOptions extends RequestInit {
  token?: string
}

function isErrorResponse(value: unknown): value is TypedErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'code' in value &&
    typeof (value as TypedErrorResponse).error === 'string' &&
    typeof (value as TypedErrorResponse).code === 'string'
  )
}

/** Typed fetch wrapper for Netlify functions with consistent error shapes. */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  try {
    const headers = new Headers(options.headers)
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
    if (options.token) {
      headers.set('Authorization', `Bearer ${options.token}`)
    }

    const response = await fetch(path, { ...options, headers })
    const raw = await response.text()
    const parsed: unknown = raw ? JSON.parse(raw) : null

    if (!response.ok) {
      if (isErrorResponse(parsed)) {
        throw new ApiError(parsed.error, parsed.code, response.status)
      }
      throw new ApiError('Request failed', 'REQUEST_FAILED', response.status)
    }

    return parsed as T
  } catch (error) {
    logDevError(error)
    if (error instanceof ApiError) throw error
    throw new ApiError('Unable to reach Nexua services', 'NETWORK_ERROR', 0)
  }
}

function localResponseForMode(mode: ChatMode, message: string): AIChatResponse {
  const intro =
    mode === 'code'
      ? 'Here is a practical implementation path.'
      : mode === 'deep_research'
        ? 'Deep research plan and synthesis.'
        : mode === 'research'
          ? 'Research summary with source placeholders.'
          : 'Here is a concise response.'

  const content = `${intro}

I received: "${message.slice(0, 280)}"

This local response is active because no configured serverless AI provider responded. Configure GROQ_API_KEY, GEMINI_API_KEY, or MISTRAL_API_KEY in Netlify to enable live model routing.`

  return {
    content,
    provider: 'local',
    model: 'nexua-local-dev',
    citations:
      mode === 'research' || mode === 'deep_research'
        ? [
            {
              id: 'local-citation',
              title: 'Configure live research providers',
              url: 'https://docs.netlify.com/functions/environment-variables/',
              publisher: 'Netlify Docs',
              snippet: 'Environment variables unlock production AI routing for deployed functions.'
            }
          ]
        : undefined,
    steps:
      mode === 'deep_research'
        ? [
            {
              id: 'scope',
              title: 'Scope question',
              status: 'complete',
              detail: 'Parsed the request and identified the intended research target.'
            },
            {
              id: 'synthesize',
              title: 'Synthesize answer',
              status: 'complete',
              detail: 'Returned a local synthesis while external providers are unavailable.'
            }
          ]
        : undefined
  }
}

function parseStreamLine(line: string): AIStreamChunk | null {
  const trimmed = line.trim()
  if (!trimmed || !trimmed.startsWith('data:')) return null
  const data = trimmed.slice(5).trim()
  if (data === '[DONE]') return { done: true }
  return JSON.parse(data) as AIStreamChunk
}

/** Streams an AI response from Netlify Functions and falls back to a local dev response. */
export async function streamChatResponse(
  input: AIChatRequest,
  token: string | undefined,
  onToken: (token: string) => void
): Promise<AIChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      throw new ApiError('AI request failed', 'AI_REQUEST_FAILED', response.status)
    }

    if (!response.body) {
      return (await response.json()) as AIChatResponse
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let content = ''
    let finalResponse: AIChatResponse | null = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const chunk = parseStreamLine(line)
        if (!chunk) continue
        if (chunk.error) throw new ApiError(chunk.error, 'AI_STREAM_ERROR', 500)
        if (chunk.token) {
          content += chunk.token
          onToken(chunk.token)
        }
        if (chunk.response) {
          finalResponse = chunk.response
        }
      }
    }

    return finalResponse ?? {
      content,
      provider: 'local',
      model: 'stream-fallback'
    }
  } catch (error) {
    logDevError(error)
    const fallback = localResponseForMode(input.mode, input.message)
    onToken(fallback.content)
    return fallback
  }
}
