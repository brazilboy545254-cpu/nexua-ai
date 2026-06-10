import { Check, Copy, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { logDevError } from '@/lib/utils'

interface MessageActionsProps {
  content: string
  onRetry?: () => void
  onDelete?: () => void
}

export function MessageActions({ content, onRetry, onDelete }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch (error) {
      logDevError(error)
    }
  }

  return (
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void copyMessage()}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      {onRetry ? (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
