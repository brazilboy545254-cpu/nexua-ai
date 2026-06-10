import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSidebarStore } from '@/store/sidebarStore'
import { Sidebar } from './Sidebar'

export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebarStore()

  if (!mobileOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation overlay"
        className="absolute inset-0 bg-background/80"
        onClick={() => setMobileOpen(false)}
      />
      <div className="relative h-full w-80 max-w-[85vw]">
        <Sidebar mobile />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
