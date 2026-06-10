import { ArrowRight, FolderKanban, MessageSquare, Plus, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AdBanner } from '@/components/ads/AdBanner'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { routes } from '@/config/routes'
import { useChats } from '@/hooks/useChats'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useProjects } from '@/hooks/useProjects'
import { formatRelativeDate, truncate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'

export default function DashboardPage() {
  usePageMeta('Dashboard')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const defaultMode = useSettingsStore((state) => state.defaultMode)
  const { chats, create } = useChats(user?.id)
  const { projects } = useProjects(user?.id)

  async function newChat() {
    const chat = await create({ mode: defaultMode })
    navigate(routes.chat(chat.id))
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 lg:p-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chats.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Saved conversations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-secondary" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Active workspaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4 text-accent" />
              Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold capitalize">{defaultMode.replace('_', ' ')}</p>
            <p className="mt-1 text-sm text-muted-foreground">Default assistant route</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recent chats</h2>
            <Button onClick={() => void newChat()}>
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No chats yet.</div>
            ) : (
              chats.slice(0, 6).map((chat) => (
                <Link
                  key={chat.id}
                  to={routes.chat(chat.id)}
                  className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{truncate(chat.title, 80)}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(chat.updatedAt)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>
          <AdBanner />
        </div>

        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Button asChild variant="outline" size="sm">
              <Link to={routes.projects}>View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                to={routes.project(project.id)}
                className="block rounded-lg border bg-card p-4 hover:border-primary/60"
              >
                <div className="h-2 w-14 rounded-full" style={{ backgroundColor: project.color }} />
                <p className="mt-3 truncate text-sm font-semibold">{project.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {project.description || 'No description yet.'}
                </p>
              </Link>
            ))}
            {projects.length === 0 ? (
              <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
                Projects will appear here after you create one.
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  )
}
