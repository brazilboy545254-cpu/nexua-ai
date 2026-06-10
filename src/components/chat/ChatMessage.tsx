import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/common/Avatar'
import { cn, formatDateTime } from '@/lib/utils'
import type { Message } from '@/types/chat.types'
import { CodeBlock } from './CodeBlock'
import { MessageActions } from './MessageActions'

interface ChatMessageProps {
  message: Message
  onRetry?: () => void
  onDelete?: () => void
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const code = String(children).replace(/\n$/, '')
    if (match) {
      return <CodeBlock code={code} language={match[1]} />
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }
}

export function ChatMessage({ message, onRetry, onDelete }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const citations = message.metadata?.citations

  return (
    <article className={cn('group flex gap-3 px-4 py-5', isUser && 'bg-muted/25')}>
      <Avatar
        name={isUser ? 'You' : 'Nexua AI'}
        className={cn(isUser ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground')}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{isUser ? 'You' : 'Nexua AI'}</span>
          <span className="text-xs text-muted-foreground">{formatDateTime(message.createdAt)}</span>
          {message.provider ? <Badge tone="muted">{message.model || message.provider}</Badge> : null}
          {message.metadata?.attachmentName ? (
            <Badge tone="secondary">{message.metadata.attachmentName}</Badge>
          ) : null}
        </div>
        <div className="prose-nexua max-w-none text-sm leading-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {citations && citations.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {citations.map((citation) => (
              <a
                key={citation.id}
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {citation.title}
              </a>
            ))}
          </div>
        ) : null}
      </div>
      <MessageActions content={message.content} onRetry={onRetry} onDelete={onDelete} />
    </article>
  )
}
