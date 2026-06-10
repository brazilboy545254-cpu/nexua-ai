import {
  FolderKanban,
  Home,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  TimerReset,
  Trash2
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { routes } from '@/config/routes'
import { useChats } from '@/hooks/useChats'
import { useProjects } from '@/hooks/useProjects'
import { truncate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useSidebarStore } from '@/store/sidebarStore'
import type { Project } from '@/types/project.types'
import { SidebarItem } from './SidebarItem'

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const defaultMode = useSettingsStore((state) => state.defaultMode)
  const { collapsed, toggleCollapsed } = useSidebarStore()
  const isCollapsed = collapsed && !mobile
  const { chats, create, rename, remove } = useChats(user?.id)
  const { projects, create: createProject } = useProjects(user?.id)
  const [projectOpen, setProjectOpen] = useState(false)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  async function newChat(projectId?: string) {
    const chat = await create({ mode: defaultMode, projectId: projectId ?? null })
    navigate(routes.chat(chat.id))
  }

  async function submitProject(values: Pick<Project, 'name' | 'description' | 'color'>) {
    await createProject(values)
  }

  return (
    <aside
      className={`flex h-full flex-col border-r bg-card/80 backdrop-blur ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b px-4">
        <Link to={routes.dashboard} className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {!isCollapsed ? <span className="truncate text-base font-bold">Nexua AI</span> : null}
        </Link>
        {!mobile ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleCollapsed}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <Button className="mb-3 w-full" size={isCollapsed ? 'icon' : 'default'} onClick={() => void newChat()}>
          <Plus className="h-4 w-4" />
          {!isCollapsed ? 'New chat' : null}
        </Button>

        <nav className="space-y-1">
          <SidebarItem to={routes.dashboard} icon={Home} label="Dashboard" collapsed={isCollapsed} />
          <SidebarItem to={routes.chatNew} icon={MessageSquare} label="Chat" collapsed={isCollapsed} />
          <SidebarItem to={routes.research} icon={Search} label="Research" collapsed={isCollapsed} />
          <SidebarItem to={routes.projects} icon={FolderKanban} label="Projects" collapsed={isCollapsed} />
          <SidebarItem to={routes.recents} icon={TimerReset} label="Recents" collapsed={isCollapsed} />
          <SidebarItem to={routes.settings} icon={Settings} label="Settings" collapsed={isCollapsed} />
        </nav>

        {!isCollapsed ? (
          <div className="mt-6 space-y-6">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase text-muted-foreground">Recent chats</h2>
              </div>
              <div className="space-y-1">
                {chats.slice(0, 8).map((chat) => (
                  <div key={chat.id} className="group flex items-center gap-1 rounded-md hover:bg-muted">
                    {editingChatId === chat.id ? (
                      <form
                        className="flex-1"
                        onSubmit={(event) => {
                          event.preventDefault()
                          void rename(chat.id, editingTitle || chat.title)
                          setEditingChatId(null)
                        }}
                      >
                        <Input
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                          onBlur={() => setEditingChatId(null)}
                          className="h-8"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <Link to={routes.chat(chat.id)} className="min-w-0 flex-1 px-2 py-2 text-sm">
                        {truncate(chat.title, 28)}
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      aria-label="Rename chat"
                      onClick={() => {
                        setEditingChatId(chat.id)
                        setEditingTitle(chat.title)
                      }}
                    >
                      <span className="text-xs">Aa</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      aria-label="Delete chat"
                      onClick={() => void remove(chat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase text-muted-foreground">Projects</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setProjectOpen(true)}
                  aria-label="New project"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {projects.slice(0, 6).map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => navigate(routes.project(project.id))}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <ProjectModal open={projectOpen} onOpenChange={setProjectOpen} onSubmit={submitProject} />
    </aside>
  )
}
