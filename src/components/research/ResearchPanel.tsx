import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface ResearchPanelProps {
  query: string
  loading?: boolean
  onQueryChange: (value: string) => void
  onSubmit: () => void
}

export function ResearchPanel({ query, loading, onQueryChange, onSubmit }: ResearchPanelProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Textarea
        value={query}
        rows={4}
        placeholder="Research a topic, comparison, paper, product, or decision..."
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={onSubmit} disabled={loading || !query.trim()}>
          <Search className="h-4 w-4" />
          Research
        </Button>
      </div>
    </div>
  )
}
