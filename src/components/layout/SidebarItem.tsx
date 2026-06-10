import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  to: string
  icon: LucideIcon
  label: string
  collapsed?: boolean
}

export function SidebarItem({ to, icon: Icon, label, collapsed }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
          isActive && 'bg-muted text-foreground',
          collapsed && 'justify-center px-0'
        )
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </NavLink>
  )
}
