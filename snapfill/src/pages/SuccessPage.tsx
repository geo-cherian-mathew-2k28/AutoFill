import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import type { ExtractedDocument } from '@/types/document'

interface SuccessPageProps { document: ExtractedDocument; onStartAgain: () => void }

export function SuccessPage({ document, onStartAgain }: SuccessPageProps) {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-panel bg-emerald-50 text-emerald-500"><CheckCircle2 size={40} /></span>
        <p className="mt-8 text-sm font-bold text-emerald-600">ALL SET</p><h1 className="mt-2 text-4xl font-bold text-ink">Details saved locally</h1>
        <p className="mt-3 text-muted">Your {document.displayName.toLowerCase()} details are ready for the SnapFill Local Agent.</p>
        <p className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ShieldCheck size={18} /> Stored only on this device</p>
        <Button className="mt-7" variant="secondary" onClick={onStartAgain}><RotateCcw size={17} /> Scan another document</Button>
      </motion.div>
    </div>
  )
}
