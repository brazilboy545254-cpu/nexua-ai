import type { AIChatRequest, AIChatResponse } from '../../../src/types/ai.types'
import type { AIProvider, ChatMode } from '../../../src/types/chat.types'
import type { Citation, ResearchStep } from '../../../src/types/research.types'

interface ProviderRoute {
  provider: AIProvider
  model: string
  modes: ChatMode[]
  envKey?: string
  priority: number
}

interface OpenAIStyleChoice {
  message?: {
    content?: string
  }
}

interface OpenAIStyleResponse {
  choices?: OpenAIStyleChoice[]
}

interface GeminiPart {
  text?: string
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[]
    }
  }>
}

const routes: ProviderRoute[] = [
  {
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    modes: ['chat', 'code'],
    envKey: 'GROQ_API_KEY',
    priority: 1
  },
  {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    modes: ['research', 'deep_research'],
    envKey: 'GEMINI_API_KEY',
    priority: 1
  },
  {
    provider: 'mistral',
    model: 'mistral-large-latest',
    modes: ['chat', 'research', 'code'],
    envKey: 'MISTRAL_API_KEY',
    priority: 2
  },
  {
    provider: 'local',
    model: 'nexua-local-dev',
    modes: ['chat', 'research', 'deep_research', 'code'],
    priority: 99
  }
]

function systemPrompt(mode: ChatMode) {
  if (mode === 'code') {
    return 'You are Nexua AI. Give precise engineering help with concise explanations and correct code.'
  }
  if (mode === 'research') {
    return 'You are Nexua AI in research mode. Return structured, cited, careful answers.'
  }
  if (mode === 'deep_research') {
    return 'You are Nexua AI in deep research mode. Decompose, analyze, synthesize, and state limitations.'
  }
  return 'You are Nexua AI, a concise and useful AI workspace assistant.'
}

function eligibleRoutes(mode: ChatMode) {
  return routes
    .filter((route) => route.modes.includes(mode))
    .filter((route) => route.provider === 'local' || Boolean(route.envKey && process.env[route.envKey]))
    .sort((left, right) => left.priority - right.priority)
}

function localResponse(input: AIChatRequest): AIChatResponse {
  const citations: Citation[] | undefined =
    input.mode === 'research' || input.mode === 'deep_research'
      ? [
          {
            id: 'local-source',
            title: 'Netlify environment variables',
            url: 'https://docs.netlify.com/functions/environment-variables/',
            publisher: 'Netlify Docs',
            snippet: 'Set provider keys in the Netlify dashboard to enable production AI routing.'
          }
        ]
      : undefined
  const steps: ResearchStep[] | undefined =
    input.mode === 'deep_research'
      ? [
          {
            id: 'scope',
            title: 'Scope request',
            status: 'complete',
            detail: 'Identified the goal and constraints from the prompt.'
          },
          {
            id: 'synthesize',
            title: 'Synthesize response',
            status: 'complete',
            detail: 'Returned local development output because no live provider key is configured.'
          }
        ]
      : undefined

  return {
    provider: 'local',
    model: 'nexua-local-dev',
    content: `${systemPrompt(input.mode)}

Prompt: ${input.message}

Configure GROQ_API_KEY, GEMINI_API_KEY, or MISTRAL_API_KEY to replace this local development response with live model output.`,
    citations,
    steps
  }
}

function messagesForOpenAI(input: AIChatRequest) {
  return [
    { role: 'system', content: systemPrompt(input.mode) },
    ...(input.attachmentContext
      ? [{ role: 'system', content: `Attached context:\n${input.attachmentContext.slice(0, 12000)}` }]
      : []),
    ...input.history.map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content
    })),
    { role: 'user', content: input.message }
  ]
}

async function callGroq(route: ProviderRoute, input: AIChatRequest): Promise<AIChatResponse> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: route.model,
      messages: messagesForOpenAI(input),
      temperature: 0.4
    })
  })
  if (!response.ok) throw new Error(`Groq failed with ${response.status}`)
  const body = (await response.json()) as OpenAIStyleResponse
  return {
    provider: route.provider,
    model: route.model,
    content: body.choices?.[0]?.message?.content ?? ''
  }
}

async function callMistral(route: ProviderRoute, input: AIChatRequest): Promise<AIChatResponse> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: route.model,
      messages: messagesForOpenAI(input),
      temperature: 0.35
    })
  })
  if (!response.ok) throw new Error(`Mistral failed with ${response.status}`)
  const body = (await response.json()) as OpenAIStyleResponse
  return {
    provider: route.provider,
    model: route.model,
    content: body.choices?.[0]?.message?.content ?? ''
  }
}

async function callGemini(route: ProviderRoute, input: AIChatRequest): Promise<AIChatResponse> {
  const prompt = [
    systemPrompt(input.mode),
    input.attachmentContext ? `Attached context:\n${input.attachmentContext.slice(0, 12000)}` : '',
    ...input.history.map((message) => `${message.role}: ${message.content}`),
    `user: ${input.message}`
  ]
    .filter(Boolean)
    .join('\n\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${route.model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    }
  )
  if (!response.ok) throw new Error(`Gemini failed with ${response.status}`)
  const body = (await response.json()) as GeminiResponse
  return {
    provider: route.provider,
    model: route.model,
    content: body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
  }
}

async function callRoute(route: ProviderRoute, input: AIChatRequest) {
  if (route.provider === 'groq') return callGroq(route, input)
  if (route.provider === 'gemini') return callGemini(route, input)
  if (route.provider === 'mistral') return callMistral(route, input)
  return localResponse(input)
}

/** Routes requests across configured providers and falls back without exposing secrets. */
export async function routeAI(input: AIChatRequest): Promise<AIChatResponse> {
  const availableRoutes = eligibleRoutes(input.mode)
  for (const route of availableRoutes) {
    try {
      const response = await callRoute(route, input)
      if (response.content.trim()) return response
    } catch (error) {
      console.error(error)
    }
  }
  return localResponse(input)
}

export function toSseEvents(response: AIChatResponse) {
  const words = response.content.match(/\S+\s*/g) ?? [response.content]
  const events = words.map((token) => `data: ${JSON.stringify({ token })}`)
  events.push(`data: ${JSON.stringify({ response })}`)
  return events
}
