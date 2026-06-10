import { FolderKanban, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdSlot } from '@/components/ads/AdSlot'
import { routes } from '@/config/routes'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useRecents } from '@/hooks/useRecents'
import { formatRelativeDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function RecentsPage() {
  usePageMeta('Recents')
  const user = useAuthStore((state) => state.user)
  const { items } = useRecents(user?.id)

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[1fr_320px] lg:p-8">
      <section>
        <h1 className="text-2xl font-bold">Recents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Recent chats and project activity in one timeline.</p>
        <div className="mt-6 overflow-hidden rounded-lg border bg-card">
          {items.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground">Workspace activity will appear here.</div>
          ) : (
            items.map((item) => {
              const Icon = item.entityType === 'chat' ? MessageSquare : FolderKanban
              const to = item.entityType === 'chat' ? routes.chat(item.entityId) : routes.project(item.entityId)
              return (
                <Link
                  key={item.id}
                  to={to}
                  className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.action} {formatRelativeDate(item.createdAt)}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>
      <aside className="hidden lg:block">
        {import.meta.env.VITE_ADSENSE_CLIENT ? (
          <AdSlot slotId="0000000001" format="rectangle" />
        ) : (
          <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
            AdSense placement is enabled when VITE_ADSENSE_CLIENT is configured.
          </div>
        )}
      </aside>
    </div>
  )
}
