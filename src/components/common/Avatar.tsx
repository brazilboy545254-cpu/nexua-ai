import { UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name: string
  className?: string
}

export function Avatar({ src, name, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-sm font-semibold',
        className
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : name ? (
        name.slice(0, 1).toUpperCase()
      ) : (
        <UserRound className="h-4 w-4" />
      )}
    </div>
  )
}
