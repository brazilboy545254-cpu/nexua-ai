import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { logDevError } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch (error) {
      logDevError(error)
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-slate-300">
        <span>{language || 'code'}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-slate-200 hover:bg-white/10"
          onClick={() => void copyCode()}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm">
        <code className={language ? `language-${language}` : undefined}>{code}</code>
      </pre>
    </div>
  )
}
