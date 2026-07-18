import { ScanLine, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface AppHeaderProps {
  onHome: () => void
  onScan: () => void
}

export function AppHeader({ onHome, onScan }: AppHeaderProps) {
  return (
    <header className="border-b border-line bg-white/90 px-5 backdrop-blur md:px-8">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
        <button className="focus-ring flex items-center gap-2 rounded-lg" onClick={onHome} aria-label="Go to SnapFill home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white"><ScanLine size={19} strokeWidth={2.4} /></span>
          <span className="text-lg font-bold text-ink">SnapFill</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-sm font-medium text-muted sm:flex"><Sparkles size={15} className="text-sky" /> Private by design</span>
          <Button variant="secondary" size="sm" onClick={onScan}>New scan</Button>
        </div>
      </div>
    </header>
  )
}
