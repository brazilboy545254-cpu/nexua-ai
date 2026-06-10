import { useCallback, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { apiFetch } from '@/lib/api'
import { getFirebaseAuth, googleProvider } from '@/lib/firebase'
import { createId, logDevError } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser } from '@/types/auth.types'

interface UserSyncResponse {
  userId: string
}

async function toAuthUser(firebaseUser: User): Promise<AuthUser> {
  try {
    const token = await firebaseUser.getIdToken()
    let userId = firebaseUser.uid

    try {
      const synced = await apiFetch<UserSyncResponse>('/api/user-sync', {
        method: 'POST',
        token,
        body: JSON.stringify({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL
        })
      })
      userId = synced.userId
    } catch (error) {
      logDevError(error)
    }

    return {
      id: userId,
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email ?? 'user@nexua.local',
      displayName: firebaseUser.displayName ?? 'Nexua User',
      avatarUrl: firebaseUser.photoURL ?? undefined,
      plan: 'free',
      token
    }
  } catch (error) {
    logDevError(error)
    throw new Error('Unable to read the authenticated session.')
  }
}

function createDevUser(): AuthUser {
  return {
    id: 'local-user',
    firebaseUid: 'local-user',
    email: 'dev@nexua.local',
    displayName: 'Local Nexua User',
    plan: 'free',
    token: createId('dev_token')
  }
}

/** Wires Firebase auth into the app store and provides Google sign-in actions. */
export function useAuth() {
  const { user, loading, error, setUser, setLoading, setError, signOutLocal } = useAuthStore()

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      async function syncUser() {
        try {
          setLoading(true)
          if (!firebaseUser) {
            setUser(null)
            return
          }
          setUser(await toAuthUser(firebaseUser))
        } catch (syncError) {
          logDevError(syncError)
          setError('Unable to restore your session.')
        } finally {
          setLoading(false)
        }
      }

      void syncUser()
    })

    return unsubscribe
  }, [setError, setLoading, setUser])

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true)
      const auth = getFirebaseAuth()
      if (!auth) {
        setUser(createDevUser())
        return
      }
      const credential = await signInWithPopup(auth, googleProvider)
      setUser(await toAuthUser(credential.user))
    } catch (signInError) {
      logDevError(signInError)
      setError('Google sign-in did not complete.')
    } finally {
      setLoading(false)
    }
  }, [setError, setLoading, setUser])

  const signOutUser = useCallback(async () => {
    try {
      const auth = getFirebaseAuth()
      if (auth) {
        await signOut(auth)
      }
      signOutLocal()
    } catch (signOutError) {
      logDevError(signOutError)
      setError('Unable to sign out right now.')
    }
  }, [setError, signOutLocal])

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOutUser
  }
}
