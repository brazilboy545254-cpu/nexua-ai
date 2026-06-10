import { useCallback, useEffect, useState } from 'react'
import * as db from '@/lib/localDb'
import { logDevError } from '@/lib/utils'
import type { Project } from '@/types/project.types'

/** Loads and mutates project records for the authenticated workspace. */
export function useProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setProjects(userId ? db.getProjects(userId) : [])
      setError(null)
    } catch (refreshError) {
      logDevError(refreshError)
      setError('Unable to load projects.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: Pick<Project, 'name' | 'description' | 'color'>) => {
      try {
        if (!userId) throw new Error('Missing user')
        const project = db.createProject(userId, input)
        await refresh()
        return project
      } catch (createError) {
        logDevError(createError)
        setError('Unable to create project.')
        throw createError
      }
    },
    [refresh, userId]
  )

  const update = useCallback(
    async (project: Project) => {
      try {
        const updated = db.updateProject({ ...project, updatedAt: new Date().toISOString() })
        await refresh()
        return updated
      } catch (updateError) {
        logDevError(updateError)
        setError('Unable to update project.')
        throw updateError
      }
    },
    [refresh]
  )

  const remove = useCallback(
    async (projectId: string) => {
      try {
        db.deleteProject(projectId)
        await refresh()
      } catch (removeError) {
        logDevError(removeError)
        setError('Unable to delete project.')
      }
    },
    [refresh]
  )

  return { projects, loading, error, refresh, create, update, remove }
}
