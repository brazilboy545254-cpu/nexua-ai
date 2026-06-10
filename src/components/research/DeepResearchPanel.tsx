import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import type { ResearchStep } from '@/types/research.types'

interface DeepResearchPanelProps {
  steps: ResearchStep[]
}

export function DeepResearchPanel({ steps }: DeepResearchPanelProps) {
  if (steps.length === 0) return null

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-semibold">Deep research chain</h2>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex gap-3">
            <div className="mt-0.5">
              {step.status === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-accent" />
              ) : step.status === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
