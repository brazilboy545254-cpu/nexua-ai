import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ProjectList } from '@/components/projects/ProjectList'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { useChats } from '@/hooks/useChats'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useProjects } from '@/hooks/useProjects'
import { useAuthStore } from '@/store/authStore'
import type { Project } from '@/types/project.types'

export default function ProjectsPage() {
  usePageMeta('Projects')
  const user = useAuthStore((state) => state.user)
  const { chats } = useChats(user?.id)
  const { projects, create, update, remove } = useProjects(user?.id)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | undefined>()
  const [deleting, setDeleting] = useState<Project | null>(null)

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize related AI work into durable spaces.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined)
            setModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>
      <ProjectList
        projects={projects}
        chats={chats}
        onNew={() => setModalOpen(true)}
        onEdit={(project) => {
          setEditing(project)
          setModalOpen(true)
        }}
        onDelete={setDeleting}
      />
      <ProjectModal
        open={modalOpen}
        project={editing}
        onOpenChange={setModalOpen}
        onSubmit={async (values) => {
          if (editing) {
            await update({ ...editing, ...values })
          } else {
            await create(values)
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Delete project?"
        description="Linked chats will remain available but will no longer belong to this project."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) void remove(deleting.id)
        }}
      />
    </div>
  )
}
