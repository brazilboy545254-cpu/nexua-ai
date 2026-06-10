# Nexua AI

Nexua AI is a Vite, React, TypeScript, Tailwind, Firebase, Supabase, and Netlify Functions app for AI chat, research, projects, recents, settings, PWA support, and AdSense-ready placements.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Firebase, Supabase, or provider keys, the app runs in local development mode with browser persistence and local AI fallback responses. Add the environment variables in `.env.local` and in the Netlify dashboard for production behavior.

## Production

```bash
npm run build
```

Deploy `dist` and `netlify/functions` through Netlify. Apply `supabase/schema.sql` in Supabase before enabling real user data.
