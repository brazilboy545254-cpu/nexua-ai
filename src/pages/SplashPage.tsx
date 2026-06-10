import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SplashScreen } from '@/components/common/SplashScreen'
import { routes } from '@/config/routes'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useAuthStore } from '@/store/authStore'

export default function SplashPage() {
  usePageMeta('Welcome')
  const navigate = useNavigate()
  const { user, loading } = useAuthStore()

  const nextRoute = useCallback(() => {
    navigate(user ? routes.dashboard : routes.login, { replace: true })
  }, [navigate, user])

  useEffect(() => {
    if (loading) return undefined
    const timer = window.setTimeout(nextRoute, 2500)
    return () => window.clearTimeout(timer)
  }, [loading, nextRoute])

  return <SplashScreen onSkip={nextRoute} />
}
