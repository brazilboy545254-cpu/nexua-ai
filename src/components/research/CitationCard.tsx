import { ExternalLink } from 'lucide-react'
import type { Citation } from '@/types/research.types'

interface CitationCardProps {
  citation: Citation
}

export function CitationCard({ citation }: CitationCardProps) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-lg border bg-card p-4 transition-colors hover:border-secondary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold">{citation.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{citation.publisher || citation.url}</p>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{citation.snippet}</p>
    </a>
  )
}
