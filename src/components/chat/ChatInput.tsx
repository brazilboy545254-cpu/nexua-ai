import { Mic, MicOff, Paperclip, Send, X } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { extractAttachmentText } from '@/lib/fileText'
import { logDevError, truncate } from '@/lib/utils'
import type { ChatAttachment } from '@/types/chat.types'

interface ChatInputProps {
  disabled?: boolean
  onSubmit: (content: string, attachment?: ChatAttachment) => Promise<void>
}

function getSpeechConstructor() {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

export function ChatInput({ disabled, onSubmit }: ChatInputProps) {
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState<ChatAttachment | undefined>()
  const [recording, setRecording] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const speechRef = useRef<SpeechRecognition | null>(null)
  const supportsSpeech = typeof window !== 'undefined' && Boolean(getSpeechConstructor())

  async function submit() {
    const trimmed = content.trim()
    if (!trimmed && !attachment) return
    await onSubmit(trimmed || `Use the attached context from ${attachment?.name}.`, attachment)
    setContent('')
    setAttachment(undefined)
  }

  async function attachFile(file: File) {
    try {
      const text = await extractAttachmentText(file)
      setAttachment({ name: file.name, mimeType: file.type || 'text/plain', text })
      toast.success('Attachment ready')
    } catch (error) {
      logDevError(error)
      toast.error(error instanceof Error ? error.message : 'Unable to attach file.')
    }
  }

  function toggleRecording() {
    const SpeechRecognition = getSpeechConstructor()
    if (!SpeechRecognition) return

    if (recording && speechRef.current) {
      speechRef.current.stop()
      setRecording(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const transcript = event.results.item(0)[0].transcript
      setContent((current) => `${current}${current ? ' ' : ''}${transcript}`)
    }
    recognition.onend = () => setRecording(false)
    recognition.onerror = () => setRecording(false)
    speechRef.current = recognition
    setRecording(true)
    recognition.start()
  }

  return (
    <form
      className="border-t bg-background/95 p-3"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <div className="mx-auto max-w-4xl rounded-lg border bg-card p-2">
        {attachment ? (
          <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs">
            <span className="truncate">{truncate(attachment.name, 54)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAttachment(undefined)}
              aria-label="Remove attachment"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
        <Textarea
          value={content}
          rows={3}
          placeholder="Ask Nexua AI..."
          disabled={disabled}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submit()
            }
          }}
          className="min-h-20 border-0 bg-transparent focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void attachFile(file)
                event.currentTarget.value = ''
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Attach file"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            {supportsSpeech ? (
              <Button
                type="button"
                variant={recording ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Voice input"
                onClick={toggleRecording}
                className={recording ? 'animate-pulse' : undefined}
              >
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            ) : null}
          </div>
          <Button type="submit" disabled={disabled || (!content.trim() && !attachment)}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </form>
  )
}
