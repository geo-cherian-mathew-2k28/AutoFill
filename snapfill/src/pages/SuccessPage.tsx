import { CheckCircle2, Link, LoaderCircle, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { type FormEvent, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { ExtractedDocument } from '@/types/document'
import { fillWithLocalAgent } from '@/utils/agentBridge'

const TEST_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScbwm7A-EsE_TtOcx5HLtpV5qN3WizLcJQfcAHKAPTb7vAtHg/viewform?usp=publish-editor'

interface SuccessPageProps { document: ExtractedDocument; onStartAgain: () => void }

export function SuccessPage({ document, onStartAgain }: SuccessPageProps) {
  const profile = useMemo(() => Object.fromEntries(document.fields.filter((field) => field.value.trim()).map((field) => [field.key, field.value.trim()])), [document])
  const [targetUrl, setTargetUrl] = useState(TEST_FORM_URL)
  const [includeOptional, setIncludeOptional] = useState(true)
  const [isFilling, setIsFilling] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      new URL(targetUrl)
      setError('')
      setMessage('')
      setIsFilling(true)
      const result = await fillWithLocalAgent(targetUrl, profile, { id: document.id, displayName: document.displayName }, includeOptional)
      setMessage(`${result.filled} field${result.filled === 1 ? '' : 's'} filled on ${result.hostname}.`)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not start the local agent.')
    } finally {
      setIsFilling(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8 md:py-14">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-panel bg-emerald-50 text-emerald-500"><CheckCircle2 size={30} /></span>
          <div><p className="text-sm font-bold text-emerald-600">AGENT READY</p><h1 className="mt-1 text-3xl font-bold text-ink">Fill a form with your reviewed details</h1><p className="mt-2 text-muted">Your {document.displayName.toLowerCase()} stays on this device and is sent only to the page you choose.</p></div>
        </div>

        <form onSubmit={submit} className="mt-8 border-y border-line py-6">
          <label htmlFor="target-url" className="text-sm font-semibold text-ink">Destination form URL</label>
          <div className="mt-2 flex gap-2">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line text-brand"><Link size={18} /></span>
            <input id="target-url" type="url" required value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} className="focus-ring h-11 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm text-ink outline-none transition hover:border-slate-300" />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-ink"><input type="checkbox" checked={includeOptional} onChange={(event) => setIncludeOptional(event.target.checked)} className="h-4 w-4 accent-brand" /> Include optional reviewed details</label>
          <Button size="lg" className="mt-6 w-full" type="submit" disabled={isFilling}>{isFilling ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}{isFilling ? 'Opening your form' : 'Autofill this form'}</Button>
        </form>

        {message && <p role="status" className="mt-4 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ShieldCheck size={18} /> Stored only in your local encrypted vault</p>
        <Button className="mt-7" variant="secondary" onClick={onStartAgain}><RotateCcw size={17} /> Scan another document</Button>
      </motion.div>
    </div>
  )
}
