import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>{message}</span>
      </div>
    </div>
  )
}
