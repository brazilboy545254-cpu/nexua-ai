import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { verifyFirebaseToken } from './_shared/auth-verify'
import { jsonResponse, optionsResponse } from './_shared/cors'

function hasSupabaseServerConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return optionsResponse()
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const user = await verifyFirebaseToken(event.headers.authorization)
    if (!hasSupabaseServerConfig()) {
      return jsonResponse(200, { userId: user.firebaseUid })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          firebase_uid: user.firebaseUid,
          email: user.email ?? 'unknown@nexua.local',
          display_name: user.displayName,
          avatar_url: user.avatarUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'firebase_uid' }
      )
      .select('id')
      .single()

    if (error) throw error
    return jsonResponse(200, { userId: data.id as string })
  } catch (error) {
    console.error(error)
    return jsonResponse(401, { error: 'Unable to sync user', code: 'USER_SYNC_FAILED' })
  }
}
