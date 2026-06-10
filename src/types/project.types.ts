export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
}

export type ActivityEntity = 'chat' | 'project'
export type ActivityAction = 'opened' | 'created' | 'renamed' | 'deleted'

export interface ActivityItem {
  id: string
  userId: string
  entityType: ActivityEntity
  entityId: string
  action: ActivityAction
  title: string
  createdAt: string
}
