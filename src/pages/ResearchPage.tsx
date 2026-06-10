import { useState } from 'react'
import toast from 'react-hot-toast'
import { DeepResearchPanel } from '@/components/research/DeepResearchPanel'
import { ResearchPanel } from '@/components/research/ResearchPanel'
import { ResearchSummary } from '@/components/research/ResearchSummary'
import { Button } from '@/components/ui/Button'
import { streamChatResponse } from '@/lib/api'
import { createId, logDevError } from '@/lib/utils'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useAuthStore } from '@/store/authStore'
import type { ChatMode } from '@/types/chat.types'
import type { ResearchResult, ResearchStep } from '@/types/research.types'

function resultFromContent(content: string, mode: ChatMode, steps?: ResearchStep[]): ResearchResult {
  return {
    summary: content,
    keyFindings: [
      'The response was generated through the configured Nexua AI routing layer.',
      'Use live provider keys for model-backed research and citations.',
      mode === 'deep_research'
        ? 'Deep research mode exposes step progress for layered analysis.'
        : 'Research mode returns a structured synthesis suitable for source review.'
    ],
    citations: [
      {
        id: createId('citation'),
        title: 'Nexua AI environment setup',
        url: 'https://docs.netlify.com/functions/environment-variables/',
        publisher: 'Netlify Docs',
        snippet: 'Configure provider keys in the Netlify environment to enable production calls.'
      }
    ],
    steps
  }
}

export default function ResearchPage() {
  usePageMeta('Research')
  const user = useAuthStore((state) => state.user)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<ChatMode>('research')
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<ResearchStep[]>([])
  const [result, setResult] = useState<ResearchResult | null>(null)

  async function runResearch() {
    if (!query.trim()) return
    try {
      setLoading(true)
      const initialSteps: ResearchStep[] =
        mode === 'deep_research'
          ? [
              { id: 'scope', title: 'Scope', status: 'running', detail: 'Breaking down the question.' },
              { id: 'retrieve', title: 'Retrieve', status: 'pending', detail: 'Finding useful source context.' },
              { id: 'synthesize', title: 'Synthesize', status: 'pending', detail: 'Composing final answer.' }
            ]
          : []
      setSteps(initialSteps)
      const response = await streamChatResponse(
        { mode, message: query, history: [] },
        user?.token,
        () => undefined
      )
      const completed = initialSteps.map((step) => ({ ...step, status: 'complete' as const }))
      setSteps(completed)
      setResult(resultFromContent(response.content, mode, response.steps ?? completed))
    } catch (error) {
      logDevError(error)
      toast.error('Unable to run research.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[380px_1fr] lg:p-8">
      <aside className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Research</h1>
          <p className="mt-1 text-sm text-muted-foreground">Structured answers with source-ready output.</p>
        </div>
        <div className="flex rounded-lg border bg-card p-1">
          <Button
            type="button"
            variant={mode === 'research' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setMode('research')}
          >
            Research
          </Button>
          <Button
            type="button"
            variant={mode === 'deep_research' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setMode('deep_research')}
          >
            Deep
          </Button>
        </div>
        <ResearchPanel query={query} loading={loading} onQueryChange={setQuery} onSubmit={runResearch} />
        <DeepResearchPanel steps={steps} />
      </aside>
      <section>
        {result ? (
          <ResearchSummary result={result} />
        ) : (
          <div className="flex min-h-96 items-center justify-center rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Research results will appear here.
          </div>
        )}
      </section>
    </div>
  )
}
