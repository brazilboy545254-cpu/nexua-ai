import type { ChatMode } from '../../../src/types/chat.types'

interface UpstashNumberResponse {
  result: number
}

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function upstashNumber(command: string, key: string, extra?: string) {
  if (!hasUpstash()) return 1
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL as string
  const token = process.env.UPSTASH_REDIS_REST_TOKEN as string
  const path = extra ? `${command}/${encodeURIComponent(key)}/${extra}` : `${command}/${encodeURIComponent(key)}`
  const response = await fetch(`${baseUrl}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) return 1
  const body = (await response.json()) as UpstashNumberResponse
  return body.result
}

/** Checks a short rolling request threshold with serverless-compatible Redis REST calls. */
export async function checkRateLimit(userKey: string, limit = 30, windowSeconds = 60) {
  if (!hasUpstash()) return { allowed: true, used: 0, limit }
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `nexua:rate:${userKey}:${bucket}`
  const used = await upstashNumber('incr', key)
  if (used === 1) {
    await upstashNumber('expire', key, String(windowSeconds + 5))
  }
  return { allowed: used <= limit, used, limit }
}

function dailyLimit(mode: ChatMode) {
  return mode === 'deep_research' ? 5 : 50
}

/** Enforces daily free-tier usage limits using a date-bucketed Redis counter. */
export async function checkDailyLimit(userKey: string, mode: ChatMode) {
  if (!hasUpstash()) {
    return { allowed: true, used: 0, limit: dailyLimit(mode) }
  }
  const date = new Date().toISOString().slice(0, 10)
  const limit = dailyLimit(mode)
  const key = `nexua:daily:${date}:${userKey}:${mode}`
  const used = await upstashNumber('incr', key)
  if (used === 1) {
    await upstashNumber('expire', key, String(60 * 60 * 30))
  }
  return { allowed: used <= limit, used, limit }
}
