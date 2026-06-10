import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

/** Applies dark, light, or system theme preference to the root document element. */
export function useTheme() {
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
    root.dataset.theme = resolved
    root.classList.toggle('dark', resolved === 'dark')
  }, [theme])
}
