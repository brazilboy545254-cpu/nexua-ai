import { useEffect } from 'react'
import { cn, logDevError } from '@/lib/utils'

interface AdSlotProps {
  slotId: string
  format: 'auto' | 'rectangle' | 'leaderboard'
  className?: string
}

export function AdSlot({ slotId, format, className }: AdSlotProps) {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (error) {
      logDevError(error)
    }
  }, [])

  return (
    <div className={cn('ad-slot', className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
