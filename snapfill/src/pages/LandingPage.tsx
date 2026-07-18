import { ArrowRight, DatabaseZap, FileCheck2, ScanSearch, ShieldCheck, Trash2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import type { DocumentType } from '@/types/document'

interface LandingPageProps {
  onScan: () => void
  onTryDemo: (type: Exclude<DocumentType, 'generic'>) => void
  hasSavedData: boolean
  onUseSavedData: () => void
  onClearSavedData: () => void
}

const features = [
  { icon: ShieldCheck, title: 'Minimum disclosure', detail: 'Required fields first' },
  { icon: ScanSearch, title: 'Local form memory', detail: 'Learns approved mappings' },
  { icon: Zap, title: 'Consent receipts', detail: 'Auditable, value-free history' },
]

export function LandingPage({ onScan, onTryDemo, hasSavedData, onUseSavedData, onClearSavedData }: LandingPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pt-24">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-brand"><ShieldCheck size={16} /> Local consent agent</span>
        <h1 className="mt-6 text-4xl font-bold leading-tight text-ink sm:text-5xl">Share less. Complete more.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">SnapFill learns how a form works, selects only approved details, and keeps a private record of each disclosure without storing the values it shared.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={onScan}><FileCheck2 size={19} /> Scan document</Button>
          <Button size="lg" variant="secondary" onClick={() => onTryDemo('aadhaar')}>Try instant demo <ArrowRight size={18} /></Button>
        </div>
      </motion.div>

      <section className="mt-16 grid gap-px overflow-hidden rounded-panel border border-line bg-line shadow-panel sm:grid-cols-3">
        {features.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="bg-white p-6 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky"><Icon size={20} /></span>
            <h2 className="mt-4 text-base font-bold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-muted">{detail}</p>
          </div>
        ))}
      </section>

      <div className="mt-12 flex flex-wrap justify-center gap-2">
        {(['aadhaar', 'pan', 'driving-license'] as const).map((type) => (
          <button key={type} onClick={() => onTryDemo(type)} className="focus-ring rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold capitalize text-muted transition hover:border-blue-200 hover:text-brand">
            Demo {type.replace('-', ' ')}
          </button>
        ))}
      </div>
      {hasSavedData && <div className="mx-auto mt-6 flex max-w-lg flex-wrap items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3"><DatabaseZap size={17} className="text-emerald-600" /><Button size="sm" variant="success" onClick={onUseSavedData}>Use saved details</Button><Button size="sm" variant="ghost" onClick={onClearSavedData}><Trash2 size={15} /> Clear saved data</Button></div>}
    </div>
  )
}
