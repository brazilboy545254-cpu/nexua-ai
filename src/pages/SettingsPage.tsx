import { Download, LogOut, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { routes } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { useChats } from '@/hooks/useChats'
import { usePageMeta } from '@/hooks/usePageMeta'
import * as db from '@/lib/localDb'
import { downloadTextFile } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { ChatMode } from '@/types/chat.types'
import type { ThemePreference } from '@/types/settings.types'

export default function SettingsPage() {
  usePageMeta('Settings')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { signOutUser } = useAuth()
  const { chats, refresh } = useChats(user?.id)
  const theme = useSettingsStore((state) => state.theme)
  const defaultMode = useSettingsStore((state) => state.defaultMode)
  const notifications = useSettingsStore((state) => state.notifications)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const setDefaultMode = useSettingsStore((state) => state.setDefaultMode)
  const setNotifications = useSettingsStore((state) => state.setNotifications)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function exportChats() {
    const messages = chats.flatMap((chat) => db.getMessages(chat.id))
    downloadTextFile(
      'nexua-chats-export.json',
      JSON.stringify({ exportedAt: new Date().toISOString(), chats, messages }, null, 2),
      'application/json'
    )
  }

  async function deleteAllChats() {
    chats.forEach((chat) => db.deleteChat(chat.id))
    await refresh()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {user ? <Avatar src={user.avatarUrl} name={user.displayName} className="h-12 w-12" /> : null}
            <div>
              <p className="font-semibold">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void signOutUser()
              navigate(routes.login, { replace: true })
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Theme
            <Select value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Default mode
            <Select value={defaultMode} onChange={(event) => setDefaultMode(event.target.value as ChatMode)}>
              <option value="chat">Chat</option>
              <option value="research">Research</option>
              <option value="deep_research">Deep research</option>
              <option value="code">Code</option>
            </Select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
            />
            Notifications
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportChats} disabled={chats.length === 0}>
            <Download className="h-4 w-4" />
            Export chats
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={chats.length === 0}>
            <Trash2 className="h-4 w-4" />
            Delete all chats
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete all chats?"
        description="This removes every locally saved chat and message in this browser."
        confirmLabel="Delete all"
        onConfirm={() => void deleteAllChats()}
      />
    </div>
  )
}
