import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  type Auth
} from 'firebase/auth'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean)

let app: FirebaseApp | null = null
let auth: Auth | null = null

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export function getFirebaseAuth() {
  if (!hasFirebaseConfig) return null
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  if (!auth) {
    auth = getAuth(app)
    void setPersistence(auth, browserLocalPersistence)
  }
  return auth
}
