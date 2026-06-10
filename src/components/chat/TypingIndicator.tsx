export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
    </div>
  )
}
