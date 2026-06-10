import { ArrowLeft, MessageSquarePlus, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { routes } from '@/config/routes'
import { useChats } from '@/hooks/useChats'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useProjects } from '@/hooks/useProjects'
import * as db from '@/lib/localDb'
import { formatRelativeDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'

export default function ProjectDetailPage() {
  usePageMeta('Project')
  const { projectId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const defaultMode = useSettingsStore((state) => state.defaultMode)
  const { chats, create } = useChats(user?.id)
  const { update } = useProjects(user?.id)
  const [project, setProject] = useState(projectId ? db.getProject(projectId) : null)
  const [editOpen, setEditOpen] = useState(false)
  const linkedChats = chats.filter((chat) => chat.projectId === project?.id)

  if (!project) {
    return (
      <div className="p-8">
        <Button asChild variant="outline">
          <Link to={routes.projects}>
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  async function newProjectChat() {
    if (!project) return
    const chat = await create({ mode: defaultMode, projectId: project.id, title: `${project.name} chat` })
    navigate(routes.chat(chat.id))
  }

  return (
    <div className="mx-auto max-w-5xl p-4 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-3">
            <Link to={routes.projects}>
              <ArrowLeft className="h-4 w-4" />
              Projects
            </Link>
          </Button>
          <div className="h-2 w-20 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="mt-3 text-2xl font-bold">{project.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {project.description || 'No description yet.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => void newProjectChat()}>
            <MessageSquarePlus className="h-4 w-4" />
            New chat
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        {linkedChats.length === 0 ? (
          <div className="p-8 text-sm text-muted-foreground">No chats linked to this project.</div>
        ) : (
          linkedChats.map((chat) => (
            <Link
              key={chat.id}
              to={routes.chat(chat.id)}
              className="flex items-center justify-between border-b px-4 py-3 last:border-b-0 hover:bg-muted/50"
            >
              <span className="truncate text-sm font-medium">{chat.title}</span>
              <span className="text-xs text-muted-foreground">{formatRelativeDate(chat.updatedAt)}</span>
            </Link>
          ))
        )}
      </div>

      <ProjectModal
        open={editOpen}
        project={project}
        onOpenChange={setEditOpen}
        onSubmit={async (values) => {
          const updated = await update({ ...project, ...values })
          setProject(updated)
        }}
      />
    </div>
  )
}
