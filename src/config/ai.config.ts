import type { AIModelRoute } from '@/types/ai.types'

export const aiModelRoutes: AIModelRoute[] = [
  {
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    modes: ['chat', 'code'],
    priority: 1,
    maxInputChars: 24000
  },
  {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    modes: ['research', 'deep_research'],
    priority: 1,
    maxInputChars: 64000
  },
  {
    provider: 'mistral',
    model: 'mistral-large-latest',
    modes: ['chat', 'research', 'code'],
    priority: 2,
    maxInputChars: 32000
  },
  {
    provider: 'local',
    model: 'nexua-local-dev',
    modes: ['chat', 'research', 'deep_research', 'code'],
    priority: 99,
    maxInputChars: 16000
  }
]

/** Selects the preferred model route for a mode with a deterministic fallback chain. */
export function getRoutesForMode(mode: AIModelRoute['modes'][number]) {
  return aiModelRoutes
    .filter((route) => route.modes.includes(mode))
    .sort((left, right) => left.priority - right.priority)
}
