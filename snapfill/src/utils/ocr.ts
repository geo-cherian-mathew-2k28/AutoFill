import type { ExtractedDocument } from '@/types/document'

type TesseractModule = typeof import('tesseract.js')
type TesseractWorker = Awaited<ReturnType<TesseractModule['createWorker']>>

let workerPromise: Promise<TesseractWorker> | undefined
let reportProgress: (progress: number) => void = () => undefined

function field(key: ExtractedDocument['fields'][number]['key'], label: string, value: string, confidence = 82) {
  return { key, label, value: value || 'Not found', confidence }
}

export function parseDocumentText(text: string, filename: string): ExtractedDocument {
  const clean = text.replace(/\s+/g, ' ').trim()
  const upper = clean.toUpperCase()
  const date = clean.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/)?.[0] ?? ''
  const aadhaar = clean.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)?.[0] ?? ''
  const pan = upper.match(/\b[A-Z]{5}\d{4}[A-Z]\b/)?.[0] ?? ''
  const licence = upper.match(/\b[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4,13}\b/)?.[0] ?? ''
  const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

  if (aadhaar) {
    return { id: crypto.randomUUID(), type: 'aadhaar', displayName: 'Aadhaar card', source: 'upload', scannedAt: 'Just now', fields: [field('fullName', 'Full name', title, 76), field('dateOfBirth', 'Date of birth', date), field('documentNumber', 'Aadhaar number', aadhaar, 96)] }
  }
  if (pan) {
    return { id: crypto.randomUUID(), type: 'pan', displayName: 'PAN card', source: 'upload', scannedAt: 'Just now', fields: [field('fullName', 'Full name', title, 76), field('dateOfBirth', 'Date of birth', date), field('documentNumber', 'PAN number', pan, 96)] }
  }
  if (licence) {
    return { id: crypto.randomUUID(), type: 'driving-license', displayName: 'Driving licence', source: 'upload', scannedAt: 'Just now', fields: [field('fullName', 'Full name', title, 76), field('dateOfBirth', 'Date of birth', date), field('documentNumber', 'Licence number', licence, 94)] }
  }
  return { id: crypto.randomUUID(), type: 'generic', displayName: 'Scanned document', source: 'upload', scannedAt: 'Just now', fields: [field('fullName', 'Document name', title, 74), field('documentNumber', 'Detected reference', clean.match(/\b[A-Z0-9-]{6,}\b/i)?.[0] ?? '', 72), field('dateOfBirth', 'Detected date', date, 72)] }
}

async function getWorker(onProgress: (progress: number) => void) {
  reportProgress = onProgress
  if (!workerPromise) {
    workerPromise = import('tesseract.js').then(({ createWorker }) => createWorker('eng', 1, {
      logger: (message) => {
        if (message.status === 'recognizing text' && typeof message.progress === 'number') {
          reportProgress(Math.max(8, Math.round(message.progress * 100)))
        }
      },
    }))
  }
  return workerPromise
}

async function prepareImage(file: File) {
  if (!file.type.startsWith('image/') || typeof createImageBitmap === 'undefined') return file
  const bitmap = await createImageBitmap(file)
  const longestEdge = Math.max(bitmap.width, bitmap.height)
  if (longestEdge <= 1600) return file
  const scale = 1600 / longestEdge
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
  return blob ?? file
}

export function warmOcr() {
  void getWorker(() => undefined).catch(() => { workerPromise = undefined })
}

export async function recognizeDocument(file: File, onProgress: (progress: number) => void) {
  onProgress(4)
  const [worker, image] = await Promise.all([getWorker(onProgress), prepareImage(file)])
  try {
    const result = await worker.recognize(image)
    return parseDocumentText(result.data.text, file.name)
  } catch (error) {
    workerPromise = undefined
    throw error
  }
}
