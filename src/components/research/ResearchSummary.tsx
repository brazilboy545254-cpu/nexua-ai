import { CitationCard } from './CitationCard'
import type { ResearchResult } from '@/types/research.types'

interface ResearchSummaryProps {
  result: ResearchResult
}

export function ResearchSummary({ result }: ResearchSummaryProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-base font-semibold">Summary</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{result.summary}</p>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-base font-semibold">Key findings</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {result.keyFindings.map((finding) => (
            <li key={finding} className="rounded-md bg-muted/50 px-3 py-2">
              {finding}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-base font-semibold">Sources</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {result.citations.map((citation) => (
            <CitationCard key={citation.id} citation={citation} />
          ))}
        </div>
      </section>
    </div>
  )
}
