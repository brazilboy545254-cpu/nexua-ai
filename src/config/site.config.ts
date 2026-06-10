export const siteConfig = {
  name: import.meta.env.VITE_APP_NAME || 'Nexua AI',
  url: import.meta.env.VITE_APP_URL || 'https://nexua.ai',
  tagline: 'Research. Chat. Create. All in one intelligent workspace.',
  description:
    'Nexua AI is an intelligent AI workspace for research, chat, coding, and knowledge discovery.',
  adsenseClient: import.meta.env.VITE_ADSENSE_CLIENT || ''
} as const
