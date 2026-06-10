import type { Chat, CreateChatInput, Message } from '@/types/chat.types'
import type { ActivityItem, ActivityAction, ActivityEntity, Project } from '@/types/project.types'
import type { UserSettings } from '@/types/settings.types'
import { createId, logDevError } from './utils'

const key = (name: string) => `nexua:v1:${name}`

function readJson<T>(name: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key(name))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    logDevError(error)
    return fallback
  }
}

function writeJson<T>(name: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value))
  } catch (error) {
    logDevError(error)
  }
}

function now() {
  return new Date().toISOString()
}

export function getChats(userId: string) {
  return readJson<Chat[]>('chats', [])
    .filter((chat) => chat.userId === userId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export function getChat(chatId: string) {
  return readJson<Chat[]>('chats', []).find((chat) => chat.id === chatId) ?? null
}

export function createChat(userId: string, input: CreateChatInput) {
  const timestamp = now()
  const chat: Chat = {
    id: createId('chat'),
    userId,
    projectId: input.projectId ?? null,
    title: input.title || 'New Chat',
    mode: input.mode,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  const chats = readJson<Chat[]>('chats', [])
  writeJson('chats', [chat, ...chats])
  createActivity(userId, 'chat', chat.id, 'created', chat.title)
  return chat
}

export function upsertChat(chat: Chat) {
  const chats = readJson<Chat[]>('chats', [])
  const next = chats.some((item) => item.id === chat.id)
    ? chats.map((item) => (item.id === chat.id ? chat : item))
    : [chat, ...chats]
  writeJson('chats', next)
  return chat
}

export function renameChat(chatId: string, title: string) {
  const chat = getChat(chatId)
  if (!chat) return null
  const updated = { ...chat, title, updatedAt: now() }
  upsertChat(updated)
  createActivity(chat.userId, 'chat', chat.id, 'renamed', title)
  return updated
}

export function updateChatProject(chatId: string, projectId: string | null) {
  const chat = getChat(chatId)
  if (!chat) return null
  return upsertChat({ ...chat, projectId, updatedAt: now() })
}

export function touchChat(chatId: string) {
  const chat = getChat(chatId)
  if (!chat) return null
  const updated = { ...chat, updatedAt: now() }
  upsertChat(updated)
  createActivity(chat.userId, 'chat', chat.id, 'opened', chat.title)
  return updated
}

export function deleteChat(chatId: string) {
  const chat = getChat(chatId)
  const chats = readJson<Chat[]>('chats', []).filter((item) => item.id !== chatId)
  const messages = readJson<Message[]>('messages', []).filter((item) => item.chatId !== chatId)
  writeJson('chats', chats)
  writeJson('messages', messages)
  if (chat) {
    createActivity(chat.userId, 'chat', chat.id, 'deleted', chat.title)
  }
}

export function getMessages(chatId: string) {
  return readJson<Message[]>('messages', [])
    .filter((message) => message.chatId === chatId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

export function addMessage(message: Message) {
  const messages = readJson<Message[]>('messages', [])
  writeJson('messages', [...messages, message])
  touchChat(message.chatId)
  return message
}

export function updateMessage(message: Message) {
  const messages = readJson<Message[]>('messages', [])
  writeJson(
    'messages',
    messages.map((item) => (item.id === message.id ? message : item))
  )
  return message
}

export function deleteMessage(messageId: string) {
  const messages = readJson<Message[]>('messages', []).filter((item) => item.id !== messageId)
  writeJson('messages', messages)
}

export function getProjects(userId: string) {
  return readJson<Project[]>('projects', [])
    .filter((project) => project.userId === userId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export function getProject(projectId: string) {
  return readJson<Project[]>('projects', []).find((project) => project.id === projectId) ?? null
}

export function createProject(
  userId: string,
  input: Pick<Project, 'name' | 'description' | 'color'>
) {
  const timestamp = now()
  const project: Project = {
    id: createId('project'),
    userId,
    name: input.name,
    description: input.description,
    color: input.color,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  const projects = readJson<Project[]>('projects', [])
  writeJson('projects', [project, ...projects])
  createActivity(userId, 'project', project.id, 'created', project.name)
  return project
}

export function updateProject(project: Project) {
  const projects = readJson<Project[]>('projects', [])
  writeJson(
    'projects',
    projects.map((item) => (item.id === project.id ? project : item))
  )
  createActivity(project.userId, 'project', project.id, 'renamed', project.name)
  return project
}

export function deleteProject(projectId: string) {
  const project = getProject(projectId)
  const projects = readJson<Project[]>('projects', []).filter((item) => item.id !== projectId)
  writeJson('projects', projects)
  readJson<Chat[]>('chats', [])
    .filter((chat) => chat.projectId === projectId)
    .forEach((chat) => updateChatProject(chat.id, null))
  if (project) {
    createActivity(project.userId, 'project', project.id, 'deleted', project.name)
  }
}

export function getActivity(userId: string) {
  return readJson<ActivityItem[]>('activity', [])
    .filter((activity) => activity.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export function createActivity(
  userId: string,
  entityType: ActivityEntity,
  entityId: string,
  action: ActivityAction,
  title: string
) {
  const activity: ActivityItem = {
    id: createId('activity'),
    userId,
    entityType,
    entityId,
    action,
    title,
    createdAt: now()
  }
  const activities = readJson<ActivityItem[]>('activity', [])
  writeJson('activity', [activity, ...activities].slice(0, 100))
  return activity
}

export function getLocalSettings(userId: string, fallback: UserSettings) {
  const settings = readJson<Record<string, UserSettings>>('settings', {})
  return settings[userId] ?? fallback
}

export function setLocalSettings(userId: string, value: UserSettings) {
  const settings = readJson<Record<string, UserSettings>>('settings', {})
  writeJson('settings', { ...settings, [userId]: value })
}
