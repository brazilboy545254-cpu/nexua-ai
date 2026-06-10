export interface Citation {
  id: string
  title: string
  url: string
  publisher?: string
  publishedAt?: string
  snippet: string
}

export interface ResearchStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'complete' | 'error'
  detail: string
}

export interface ResearchResult {
  summary: string
  keyFindings: string[]
  citations: Citation[]
  steps?: ResearchStep[]
}
