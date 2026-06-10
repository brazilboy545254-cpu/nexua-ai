import { motion } from 'framer-motion'
import logo from '@/assets/logo.svg'
import { siteConfig } from '@/config/site.config'
import { Button } from '@/components/ui/Button'

interface SplashScreenProps {
  onSkip: () => void
}

export function SplashScreen({ onSkip }: SplashScreenProps) {
  return (
    <main className="nexua-grid-bg flex min-h-screen flex-col items-center justify-center px-6">
      <Button variant="ghost" className="absolute right-4 top-4" onClick={onSkip}>
        Skip
      </Button>
      <motion.img
        src={logo}
        alt="Nexua AI"
        className="h-24 w-24"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
      >
        <h1 className="text-3xl font-bold">{siteConfig.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{siteConfig.tagline}</p>
      </motion.div>
    </main>
  )
}
