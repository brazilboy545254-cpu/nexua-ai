import { useEffect } from 'react'
import { siteConfig } from '@/config/site.config'

/** Applies page-specific document metadata for SPA navigation. */
export function usePageMeta(title: string, description: string = siteConfig.description) {
  useEffect(() => {
    document.title = `${title} | ${siteConfig.name}`
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) {
      meta.content = description
    }
  }, [description, title])
}
