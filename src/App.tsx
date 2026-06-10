import { lazy, Suspense, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGuard } from '@/components/common/AuthGuard'
import { FullPageSpinner } from '@/components/common/FullPageSpinner'
import { AppShell } from '@/components/layout/AppShell'
import { routes } from '@/config/routes'
import { siteConfig } from '@/config/site.config'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { logDevError } from '@/lib/utils'

const SplashPage = lazy(() => import('@/pages/SplashPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ChatPage = lazy(() => import('@/pages/ChatPage'))
const NewChatPage = lazy(() => import('@/pages/NewChatPage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const RecentsPage = lazy(() => import('@/pages/RecentsPage'))
const ResearchPage = lazy(() => import('@/pages/ResearchPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function useAdsenseScript() {
  useEffect(() => {
    const client = siteConfig.adsenseClient
    if (!client || document.querySelector('[data-nexua-adsense]')) return
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
    script.dataset.nexuaAdsense = 'true'
    document.head.append(script)
  }, [])
}

function useInstallPromptCounter() {
  useEffect(() => {
    try {
      const count = Number(window.localStorage.getItem('nexua:v1:visits') ?? '0') + 1
      window.localStorage.setItem('nexua:v1:visits', String(count))
    } catch (error) {
      logDevError(error)
    }
  }, [])
}

export default function App() {
  useAuth()
  useTheme()
  useAdsenseScript()
  useInstallPromptCounter()

  return (
    <BrowserRouter>
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route path={routes.splash} element={<SplashPage />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path={routes.login} element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route element={<AppShell />}>
              <Route path={routes.dashboard} element={<DashboardPage />} />
              <Route path={routes.chatNew} element={<NewChatPage />} />
              <Route path="/chat/:chatId" element={<ChatPage />} />
              <Route path={routes.projects} element={<ProjectsPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path={routes.recents} element={<RecentsPage />} />
              <Route path={routes.research} element={<ResearchPage />} />
              <Route path={routes.settings} element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'border bg-card text-foreground',
          ariaProps: {
            role: 'status',
            'aria-live': 'polite'
          }
        }}
      />
    </BrowserRouter>
  )
}
