import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '@/config/routes'
import { useAuthStore } from '@/store/authStore'
import { FullPageSpinner } from './FullPageSpinner'

export function AuthGuard() {
  const { user, loading } = useAuthStore()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to={routes.login} replace />
  return <Outlet />
}
