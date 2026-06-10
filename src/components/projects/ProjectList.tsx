import { FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { ProjectCard } from './ProjectCard'
import type { Chat } from '@/types/chat.types'
import type { Project } from '@/types/project.types'

interface ProjectListProps {
  projects: Project[]
  chats: Chat[]
  onNew: () => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectList({ projects, chats, onNew, onEdit, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create a project to organize chats and research around a topic."
        action={<Button onClick={onNew}>New project</Button>}
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          chatCount={chats.filter((chat) => chat.projectId === project.id).length}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
