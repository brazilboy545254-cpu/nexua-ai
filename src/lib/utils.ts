import { clsx, type ClassValue } from 'clsx'
import { formatDistanceToNowStrict, format } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export const isDev = import.meta.env.DEV

/** Merges Tailwind classes while preserving conditional class ergonomics. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Creates a stable client-side id without depending on a backend round trip. */
export function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

/** Formats recent timestamps compactly for dense navigation surfaces. */
export function formatRelativeDate(value: string) {
  try {
    return `${formatDistanceToNowStrict(new Date(value), { addSuffix: true })}`
  } catch (error) {
    logDevError(error)
    return 'recently'
  }
}

/** Formats a timestamp for exports and detail views. */
export function formatDateTime(value: string) {
  try {
    return format(new Date(value), 'PP p')
  } catch (error) {
    logDevError(error)
    return value
  }
}

/** Truncates display text without mutating the stored source content. */
export function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1)).trim()}...`
}

/** Keeps production error surfaces quiet while preserving local diagnostics. */
export function logDevError(error: unknown) {
  if (isDev) {
    console.error(error)
  }
}

/** Downloads generated data without introducing a server dependency. */
export function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
