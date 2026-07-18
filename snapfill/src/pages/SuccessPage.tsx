import { CheckCircle2, Clipboard, Download, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import type { ExtractedDocument } from '@/types/document'

interface SuccessPageProps { document: ExtractedDocument; onDownload: () => void; onCopy: () => void; onStartAgain: () => void }

export function SuccessPage({ document, onDownload, onCopy, onStartAgain }: SuccessPageProps) {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-panel bg-emerald-50 text-emerald-500"><CheckCircle2 size={40} /></span>
        <p className="mt-8 text-sm font-bold text-emerald-600">ALL SET</p><h1 className="mt-2 text-4xl font-bold text-ink">Form ready</h1>
        <p className="mt-3 text-muted">Your {document.displayName.toLowerCase()} details stayed on this device.</p>
        <div className="mt-9 grid gap-3 sm:grid-cols-2"><Button size="lg" onClick={onDownload}><Download size={18} /> Download JSON</Button><Button size="lg" variant="secondary" onClick={onCopy}><Clipboard size={18} /> Copy details</Button></div>
        <Button className="mt-4" variant="ghost" onClick={onStartAgain}><RotateCcw size={17} /> Start again</Button>
      </motion.div>
    </div>
  )
}
