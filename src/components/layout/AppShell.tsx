import { Outlet } from 'react-router-dom'
import { MobileSidebar } from './MobileSidebar'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
