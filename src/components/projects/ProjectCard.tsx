import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import { routes } from '@/config/routes'
import { formatRelativeDate } from '@/lib/utils'
import type { Project } from '@/types/project.types'

interface ProjectCardProps {
  project: Project
  chatCount?: number
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, chatCount = 0, onEdit, onDelete }: ProjectCardProps) {
  return (
    <article className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/60">
      <div className="flex items-start justify-between gap-3">
        <Link to={routes.project(project.id)} className="min-w-0">
          <div className="mb-3 h-2 w-16 rounded-full" style={{ backgroundColor: project.color }} />
          <h3 className="truncate text-base font-semibold">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {project.description || 'No description yet.'}
          </p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Project actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(project)}>
              <Pencil className="h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(project)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {chatCount} chats
        </span>
        <span>{formatRelativeDate(project.updatedAt)}</span>
      </div>
    </article>
  )
}
