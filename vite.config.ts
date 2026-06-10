import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'sitemap.xml'],
        manifest: {
          name: 'Nexua AI',
          short_name: 'Nexua',
          description: 'AI research, chat, and productivity workspace',
          start_url: '/',
          display: 'standalone',
          background_color: '#0a0a0f',
          theme_color: '#6d5aff',
          icons: [
            { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,png,webp,woff2}'],
          navigateFallbackDenylist: [/^\/api\//]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: '127.0.0.1',
      port: Number(env.VITE_DEV_PORT ?? 5173)
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            markdown: ['react-markdown', 'remark-gfm', 'rehype-highlight', 'highlight.js'],
            data: ['zustand', '@supabase/supabase-js'],
            auth: ['firebase/app', 'firebase/auth']
          }
        }
      }
    }
  }
})
