import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ExternalLink, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import type { ExtractedDocument } from '@/types/document'
import { createPrefilledUrl } from '@/utils/profileStorage'

const formSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  documentNumber: z.string().min(1, 'Document number is required'),
  address: z.string(),
  guardianName: z.string(),
})
export type FormValues = z.infer<typeof formSchema>

function valuesFor(document: ExtractedDocument): FormValues {
  const value = (key: keyof FormValues) => document.fields.find((field) => field.key === key)?.value ?? ''
  return { fullName: value('fullName'), dateOfBirth: value('dateOfBirth'), documentNumber: value('documentNumber'), address: value('address'), guardianName: value('guardianName') }
}

interface AutoFillPageProps { document: ExtractedDocument; onComplete: (values: FormValues) => void; onBack: () => void }

export function AutoFillPage({ document, onComplete, onBack }: AutoFillPageProps) {
  const defaults = useMemo(() => valuesFor(document), [document])
  const [formUrl, setFormUrl] = useState('')
  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: defaults })
  useEffect(() => reset(defaults), [defaults, reset])
  const inputs: Array<{ key: keyof FormValues; label: string; optional?: boolean }> = [
    { key: 'fullName', label: 'Full name' }, { key: 'dateOfBirth', label: 'Date of birth' }, { key: 'documentNumber', label: 'Document number' }, { key: 'address', label: 'Address', optional: true }, { key: 'guardianName', label: "Guardian's name", optional: true },
  ]
  function openPrefilledForm() {
    try {
      window.open(createPrefilledUrl(formUrl, getValues()), '_blank', 'noopener,noreferrer')
    } catch {
      window.alert('Enter a valid form URL first.')
    }
  }
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <button onClick={onBack} className="focus-ring rounded-md text-sm font-semibold text-muted hover:text-ink">Back to review</button>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold text-brand">AUTO FILL READY</p><h1 className="mt-2 text-3xl font-bold text-ink">Your form is ready</h1><p className="mt-2 text-muted">SnapFill has added the fields it recognized. You stay in control.</p></div><span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-brand">96% complete</span></div>
      <form onSubmit={handleSubmit(onComplete)} className="mt-8 rounded-panel border border-line bg-white p-5 shadow-panel sm:p-7">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-emerald-700"><ShieldCheck size={18} /> Filled locally from {document.displayName}</div>
        <div className="grid gap-5 sm:grid-cols-2">
          {inputs.map(({ key, label, optional }) => <label key={key} className={key === 'address' ? 'sm:col-span-2' : ''}><span className="mb-1.5 flex gap-1 text-sm font-semibold text-ink">{label}{optional && <span className="font-normal text-muted">(optional)</span>}</span><input {...register(key)} className="focus-ring h-11 w-full rounded-xl border border-line px-3 text-sm text-ink outline-none transition hover:border-slate-300" />{errors[key] && <span className="mt-1 block text-xs text-red-600">{errors[key]?.message}</span>}</label>)}
        </div>
        <div className="mt-6 border-t border-line pt-5"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-ink">Form URL</span><input value={formUrl} onChange={(event) => setFormUrl(event.target.value)} type="url" placeholder="https://example.com/application" className="focus-ring h-11 w-full rounded-xl border border-line px-3 text-sm text-ink outline-none transition hover:border-slate-300" /></label><Button type="button" variant="secondary" className="mt-3" onClick={openPrefilledForm}><ExternalLink size={17} /> Open prefilled form</Button></div>
        <Button size="lg" className="mt-7 w-full" type="submit"><Check size={18} /> Finish and export</Button>
      </form>
    </div>
  )
}
