import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { routes } from '@/config/routes'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta('Not found')
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div>
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The workspace page you requested does not exist.</p>
        <Button asChild className="mt-6">
          <Link to={routes.dashboard}>Back to dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
