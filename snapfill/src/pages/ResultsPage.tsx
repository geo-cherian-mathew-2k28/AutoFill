import { ArrowRight, CheckCircle2, PencilLine } from 'lucide-react'

import { DocumentArtwork } from '@/components/DocumentArtwork'
import { Button } from '@/components/ui/button'
import type { ExtractedDocument, ExtractedField } from '@/types/document'

interface ResultsPageProps {
  document: ExtractedDocument
  onChange: (fields: ExtractedField[]) => void
  onContinue: () => void
  onBack: () => void
}

export function ResultsPage({ document, onChange, onContinue, onBack }: ResultsPageProps) {
  function updateField(index: number, value: string) {
    onChange(document.fields.map((field, fieldIndex) => fieldIndex === index ? { ...field, value } : field))
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <button onClick={onBack} className="focus-ring rounded-md text-sm font-semibold text-muted hover:text-ink">Scan another document</button>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-bold text-emerald-600">EXTRACTION COMPLETE</p><h1 className="mt-2 text-3xl font-bold text-ink">Review your details</h1><p className="mt-2 text-muted">Check anything highlighted before filling the form.</p></div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={17} /> {document.fields.length} fields found</span>
      </div>
      <div className="mt-9 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div><DocumentArtwork document={document} /><p className="mt-4 text-center text-sm text-muted">{document.source === 'demo' ? 'Demo document' : 'Processed locally just now'}</p></div>
        <section className="rounded-panel border border-line bg-white p-5 shadow-panel sm:p-7">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-ink">Extracted fields</h2><PencilLine size={18} className="text-muted" /></div>
          <div className="mt-6 space-y-4">
            {document.fields.map((field, index) => <label key={field.key} className="block"><span className="mb-1.5 flex justify-between gap-4 text-sm font-semibold text-ink">{field.label}<span className={field.confidence >= 90 ? 'text-emerald-600' : 'text-amber-600'}>{field.confidence}%</span></span><input value={field.value} onChange={(event) => updateField(index, event.target.value)} className="focus-ring h-11 w-full rounded-xl border border-line px-3 text-sm text-ink outline-none transition hover:border-slate-300" /></label>)}
          </div>
          <Button size="lg" className="mt-7 w-full" onClick={onContinue}>Fill a form with these details <ArrowRight size={18} /></Button>
        </section>
      </div>
    </div>
  )
}
