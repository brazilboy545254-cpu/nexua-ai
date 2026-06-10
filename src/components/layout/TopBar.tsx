import { Menu, Moon, Search, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/common/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useSidebarStore } from '@/store/sidebarStore'

function titleFromPath(pathname: string) {
  if (pathname.startsWith('/chat')) return 'Chat'
  if (pathname.startsWith('/projects')) return 'Projects'
  if (pathname.startsWith('/recents')) return 'Recents'
  if (pathname.startsWith('/research')) return 'Research'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Dashboard'
}

export function TopBar() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen)
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{titleFromPath(location.pathname)}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden h-10 w-72 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground md:flex">
          <Search className="h-4 w-4" />
          Search workspace
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(nextTheme)}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {user ? <Avatar src={user.avatarUrl} name={user.displayName} /> : null}
      </div>
    </header>
  )
}
