import type { Handler } from '@netlify/functions'
import { z } from 'zod'
import { verifyFirebaseToken } from './_shared/auth-verify'
import { jsonResponse, optionsResponse } from './_shared/cors'
import { routeAI } from './_shared/ai-router'
import { checkDailyLimit, checkRateLimit } from './_shared/rate-limit'

const schema = z.object({
  query: z.string().min(1).max(24000),
  attachmentContext: z.string().max(120000).optional()
})

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return optionsResponse()
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const user = await verifyFirebaseToken(event.headers.authorization)
    const input = schema.parse(JSON.parse(event.body || '{}'))
    const rate = await checkRateLimit(user.firebaseUid, 12)
    if (!rate.allowed) return jsonResponse(429, { error: 'Rate limit exceeded', code: 'RATE_LIMITED' })
    const daily = await checkDailyLimit(user.firebaseUid, 'deep_research')
    if (!daily.allowed) {
      return jsonResponse(403, {
        error: 'DAILY_LIMIT_EXCEEDED',
        code: 'DAILY_LIMIT_EXCEEDED',
        limit: daily.limit,
        used: daily.used
      })
    }
    const response = await routeAI({
      mode: 'deep_research',
      message: input.query,
      history: [],
      attachmentContext: input.attachmentContext
    })
    return jsonResponse(200, response)
  } catch (error) {
    console.error(error)
    return jsonResponse(400, { error: 'Invalid deep research request', code: 'INVALID_REQUEST' })
  }
}
