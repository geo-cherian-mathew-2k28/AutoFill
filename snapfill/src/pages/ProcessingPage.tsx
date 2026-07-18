import { ScanSearch, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProcessingPageProps { progress: number }

export function ProcessingPage({ progress }: ProcessingPageProps) {
  const message = progress < 25 ? 'Preparing secure local workspace' : progress < 65 ? 'Reading document details' : 'Organizing your form fields'
  return (
    <div className="mx-auto grid min-h-[68vh] max-w-xl place-items-center px-5 text-center">
      <div className="w-full">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} className="mx-auto grid h-20 w-20 place-items-center rounded-panel border border-blue-100 bg-blue-50 text-brand"><ScanSearch size={34} /></motion.div>
        <p className="mt-8 text-sm font-bold text-brand">LOCAL PROCESSING</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Reading your document</h1>
        <p className="mt-3 text-muted">{message}</p>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-100"><motion.div className="h-full rounded-full bg-brand" animate={{ width: `${Math.max(progress, 4)}%` }} /></div>
        <p className="mt-3 text-sm font-semibold text-muted">{Math.max(progress, 4)}% complete</p>
        <p className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ShieldCheck size={18} /> Nothing is uploaded or shared</p>
      </div>
    </div>
  )
}
