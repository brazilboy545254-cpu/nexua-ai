import { AdSlot } from './AdSlot'

interface AdBannerProps {
  slotId?: string
}

export function AdBanner({ slotId = '0000000000' }: AdBannerProps) {
  if (!import.meta.env.VITE_ADSENSE_CLIENT) return null
  return <AdSlot slotId={slotId} format="auto" className="hidden md:block" />
}
