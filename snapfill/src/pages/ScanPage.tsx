import { Camera, FileImage, LockKeyhole, Upload } from 'lucide-react'
import { useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

import { Button } from '@/components/ui/button'
import type { DocumentType } from '@/types/document'
import { warmOcr } from '@/utils/ocr'

interface ScanPageProps {
  onFile: (file: File) => void
  onDemo: (type: Exclude<DocumentType, 'generic'>) => void
  onBack: () => void
}

export function ScanPage({ onFile, onDemo, onBack }: ScanPageProps) {
  useEffect(() => { warmOcr() }, [])
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    multiple: false,
    onDropAccepted: ([file]) => { if (file) onFile(file) },
  })

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <button onClick={onBack} className="focus-ring rounded-md text-sm font-semibold text-muted hover:text-ink">Back to home</button>
      <div className="mt-7 max-w-xl">
        <p className="text-sm font-bold text-brand">NEW EXTRACTION</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Add a document</h1>
        <p className="mt-3 leading-7 text-muted">Drop a clear PNG or JPEG and SnapFill will extract the fields locally in your browser.</p>
      </div>

      <div {...getRootProps()} className={`focus-ring mt-9 grid min-h-72 place-items-center rounded-panel border-2 border-dashed p-6 text-center transition ${isDragActive ? 'border-brand bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'}`}>
        <input {...getInputProps()} />
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand shadow-sm"><Upload size={25} /></span>
          <h2 className="mt-5 text-lg font-bold text-ink">{isDragActive ? 'Drop to scan' : 'Drop your document here'}</h2>
          <p className="mt-2 text-sm text-muted">or select a file from this device</p>
          <Button className="mt-5" type="button"><FileImage size={17} /> Choose file</Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-2 text-muted"><LockKeyhole size={15} className="text-emerald-500" /> Processed only on this device</span>
        <Button variant="ghost" size="sm" type="button" onClick={open}><Camera size={16} /> Use camera</Button>
      </div>

      <section className="mt-12 border-t border-line pt-7">
        <p className="text-sm font-bold text-ink">Need a quick walkthrough?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['aadhaar', 'pan', 'driving-license'] as const).map((type) => <Button key={type} variant="secondary" size="sm" onClick={() => onDemo(type)}>Use {type.replace('-', ' ')} demo</Button>)}
        </div>
      </section>
    </div>
  )
}
