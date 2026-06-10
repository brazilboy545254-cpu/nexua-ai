import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export interface VerifiedUser {
  firebaseUid: string
  email?: string
  displayName?: string
  avatarUrl?: string
}

function hasAdminConfig() {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
  )
}

function ensureAdminApp() {
  if (!hasAdminConfig()) return null
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    })
  }
  return getAuth()
}

/** Verifies Firebase ID tokens server-side; local dev falls back when admin env is absent. */
export async function verifyFirebaseToken(authHeader?: string): Promise<VerifiedUser> {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

  if (!hasAdminConfig()) {
    return {
      firebaseUid: 'local-user',
      email: 'dev@nexua.local',
      displayName: 'Local Nexua User'
    }
  }

  if (!token) {
    throw new Error('Missing authorization token.')
  }

  const auth = ensureAdminApp()
  if (!auth) {
    throw new Error('Firebase Admin is not configured.')
  }

  const decoded = await auth.verifyIdToken(token)
  return {
    firebaseUid: decoded.uid,
    email: decoded.email,
    displayName: typeof decoded.name === 'string' ? decoded.name : undefined,
    avatarUrl: typeof decoded.picture === 'string' ? decoded.picture : undefined
  }
}
