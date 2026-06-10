import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { downloadTextFile, formatDateTime } from '@/lib/utils'
import type { Chat, ChatMode, Message } from '@/types/chat.types'

interface ChatHeaderProps {
  chat: Chat | null
  mode: ChatMode
  messages: Message[]
  onModeChange: (mode: ChatMode) => void
  onDeleteChat?: () => void
}

function exportMarkdown(chat: Chat | null, messages: Message[]) {
  const title = chat?.title || 'Nexua chat'
  const body = [
    `# ${title}`,
    '',
    ...messages.map((message) => `## ${message.role} - ${formatDateTime(message.createdAt)}\n\n${message.content}`)
  ].join('\n\n')
  downloadTextFile(`${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`, body, 'text/markdown')
}

function exportJson(chat: Chat | null, messages: Message[]) {
  const title = chat?.title || 'nexua-chat'
  downloadTextFile(
    `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`,
    JSON.stringify({ chat, messages }, null, 2),
    'application/json'
  )
}

export function ChatHeader({ chat, mode, messages, onModeChange, onDeleteChat }: ChatHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-semibold">{chat?.title || 'New Chat'}</h2>
          <Badge tone={mode === 'deep_research' ? 'accent' : mode === 'research' ? 'secondary' : 'muted'}>
            {mode.replace('_', ' ')}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{messages.length} messages</p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={mode}
          onChange={(event) => onModeChange(event.target.value as ChatMode)}
          aria-label="Chat mode"
        >
          <option value="chat">Chat</option>
          <option value="research">Research</option>
          <option value="deep_research">Deep research</option>
          <option value="code">Code</option>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportMarkdown(chat, messages)}
          disabled={messages.length === 0}
        >
          <Download className="h-4 w-4" />
          MD
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportJson(chat, messages)}
          disabled={messages.length === 0}
        >
          <Download className="h-4 w-4" />
          JSON
        </Button>
        {onDeleteChat ? (
          <Button variant="ghost" size="icon" onClick={onDeleteChat} aria-label="Delete chat">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
