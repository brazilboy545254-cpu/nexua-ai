export const routes = {
  splash: '/',
  login: '/login',
  dashboard: '/dashboard',
  chatNew: '/chat/new',
  chat: (chatId: string) => `/chat/${chatId}`,
  projects: '/projects',
  project: (projectId: string) => `/projects/${projectId}`,
  recents: '/recents',
  research: '/research',
  settings: '/settings'
} as const
