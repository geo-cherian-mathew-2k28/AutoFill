import { CreditCard, FileBadge2, IdCard } from 'lucide-react'

import type { ExtractedDocument } from '@/types/document'

interface DocumentArtworkProps {
  document: ExtractedDocument
  compact?: boolean
}

export function DocumentArtwork({ document, compact = false }: DocumentArtworkProps) {
  const number = document.fields.find((field) => field.key === 'documentNumber')?.value ?? 'Ready to read'
  const name = document.fields.find((field) => field.key === 'fullName')?.value ?? 'Document holder'
  const Icon = document.type === 'aadhaar' ? IdCard : document.type === 'pan' ? CreditCard : FileBadge2
  const tint = document.type === 'aadhaar' ? 'bg-orange-50 text-orange-600' : document.type === 'pan' ? 'bg-sky-50 text-sky-600' : 'bg-indigo-50 text-indigo-600'

  return (
    <div className={`relative overflow-hidden border border-line bg-white shadow-panel ${compact ? 'rounded-2xl p-4' : 'rounded-panel p-6'}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-brand" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-muted">{document.displayName}</p>
          <p className="mt-1 text-lg font-bold text-ink">Government ID</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon size={21} /></span>
      </div>
      <div className="mt-8 flex items-end gap-4">
        <span className="grid h-14 w-12 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-400">ID</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{name}</p>
          <p className="mt-1 font-mono text-xs text-muted">{number}</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100"><div className="h-full w-4/5 rounded-full bg-sky" /></div>
        </div>
      </div>
    </div>
  )
}
