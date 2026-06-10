import type { HandlerResponse } from '@netlify/functions'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

export function optionsResponse(): HandlerResponse {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: ''
  }
}

export function jsonResponse(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

export function sseResponse(events: string[]): HandlerResponse {
  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    },
    body: `${events.join('\n\n')}\n\ndata: [DONE]\n\n`
  }
}
