import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { logDevError } from '@/lib/utils'
import type { Project } from '@/types/project.types'

const schema = z.object({
  name: z.string().min(2, 'Use at least 2 characters.').max(80),
  description: z.string().max(240).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/)
})

type ProjectFormValues = z.infer<typeof schema>

interface ProjectModalProps {
  open: boolean
  project?: Project
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProjectFormValues) => Promise<void>
}

const swatches = ['#6d5aff', '#22c55e', '#14b8a6', '#f97316', '#ef4444', '#eab308']

export function ProjectModal({ open, project, onOpenChange, onSubmit }: ProjectModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormValues>({
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      color: project?.color ?? swatches[0]
    }
  })
  const color = watch('color')

  useEffect(() => {
    reset({
      name: project?.name ?? '',
      description: project?.description ?? '',
      color: project?.color ?? swatches[0]
    })
  }, [project, reset])

  async function submit(values: ProjectFormValues) {
    try {
      const parsed = schema.parse(values)
      await onSubmit(parsed)
      onOpenChange(false)
    } catch (error) {
      logDevError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? 'Edit project' : 'New project'}</DialogTitle>
          <DialogDescription>Group related chats, research threads, and working notes.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(submit)(event)}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="project-name">
              Name
            </label>
            <Input id="project-name" {...register('name')} />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="project-description">
              Description
            </label>
            <Textarea id="project-description" rows={3} {...register('description')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {swatches.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  className="h-8 w-8 rounded-md border-2"
                  style={{
                    backgroundColor: swatch,
                    borderColor: color === swatch ? 'white' : 'transparent'
                  }}
                  aria-label={`Use color ${swatch}`}
                  onClick={() => setValue('color', swatch)}
                />
              ))}
            </div>
            <input type="hidden" {...register('color')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {project ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
