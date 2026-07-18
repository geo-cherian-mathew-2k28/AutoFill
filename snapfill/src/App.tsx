import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'

import { AppHeader } from '@/components/AppHeader'
import { PrivacyBadge } from '@/components/PrivacyBadge'
import { AutoFillPage, type FormValues } from '@/pages/AutoFillPage'
import { LandingPage } from '@/pages/LandingPage'
import { ProcessingPage } from '@/pages/ProcessingPage'
import { ResultsPage } from '@/pages/ResultsPage'
import { ScanPage } from '@/pages/ScanPage'
import { SuccessPage } from '@/pages/SuccessPage'
import type { DocumentType, ExtractedDocument, ExtractedField } from '@/types/document'
import { getDemoDocument } from '@/utils/demoData'
import { recognizeDocument } from '@/utils/ocr'
import { clearSavedDocument, loadSavedDocument, saveDocument } from '@/utils/profileStorage'

type View = 'landing' | 'scan' | 'processing' | 'results' | 'autofill' | 'success'

function App() {
  const [view, setView] = useState<View>('landing')
  const [progress, setProgress] = useState(0)
  const [document, setDocument] = useState<ExtractedDocument>(() => loadSavedDocument() ?? getDemoDocument('aadhaar'))
  const [hasSavedData, setHasSavedData] = useState(() => loadSavedDocument() !== null)

  useEffect(() => {
    if (document.source === 'upload') {
      saveDocument(document)
      setHasSavedData(true)
    }
  }, [document])

  function startDemo(type: Exclude<DocumentType, 'generic'>) {
    setDocument(getDemoDocument(type))
    setProgress(18)
    setView('processing')
    window.setTimeout(() => setProgress(72), 280)
    window.setTimeout(() => { setProgress(100); setView('results') }, 820)
  }

  async function handleFile(file: File) {
    setProgress(6)
    setView('processing')
    try {
      const result = await recognizeDocument(file, setProgress)
      setDocument(result)
      setProgress(100)
      setView('results')
    } catch {
      toast.error('Could not read that document. Try a clear PNG or JPEG, or use a demo document.')
      setView('scan')
    }
  }

  function updateFields(fields: ExtractedField[]) {
    setDocument((current) => ({ ...current, fields }))
  }

  function finishForm(values: FormValues) {
    const fields = document.fields.map((field) => ({ ...field, value: values[field.key as keyof FormValues] ?? field.value }))
    const updated = { ...document, fields }
    setDocument(updated)
    saveDocument(updated)
    setHasSavedData(true)
    setView('success')
  }

  function useSavedData() {
    const saved = loadSavedDocument()
    if (saved) {
      setDocument(saved)
      setView('autofill')
    }
  }

  function clearLocalData() {
    clearSavedDocument()
    setHasSavedData(false)
    toast.success('Saved details cleared from this device')
  }

  const onHome = () => setView('landing')
  const onScan = () => setView('scan')

  return (
    <div className="min-h-screen bg-white">
      <AppHeader onHome={onHome} onScan={onScan} />
      <main>
        {view === 'landing' && <LandingPage onScan={onScan} onTryDemo={startDemo} hasSavedData={hasSavedData} onUseSavedData={useSavedData} onClearSavedData={clearLocalData} />}
        {view === 'scan' && <ScanPage onFile={handleFile} onDemo={startDemo} onBack={onHome} />}
        {view === 'processing' && <ProcessingPage progress={progress} />}
        {view === 'results' && <ResultsPage document={document} onChange={updateFields} onContinue={() => setView('autofill')} onBack={onScan} />}
        {view === 'autofill' && <AutoFillPage document={document} onComplete={finishForm} onBack={() => setView('results')} />}
        {view === 'success' && <SuccessPage document={document} onStartAgain={onScan} />}
      </main>
      <PrivacyBadge />
      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App
