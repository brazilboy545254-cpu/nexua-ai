export type UserPlan = 'free' | 'pro' | 'team'

export interface AuthUser {
  id: string
  firebaseUid: string
  email: string
  displayName: string
  avatarUrl?: string
  plan: UserPlan
  token?: string
}
