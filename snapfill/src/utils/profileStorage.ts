import type { ExtractedDocument } from '@/types/document'

const STORAGE_KEY = 'snapfill.saved-profile.v1'

export function loadSavedDocument(): ExtractedDocument | null {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (value && typeof value === 'object' && 'fields' in value && Array.isArray(value.fields)) return value as ExtractedDocument
  } catch {
    // Ignore invalid data from an older local version.
  }
  return null
}

export function saveDocument(document: ExtractedDocument) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
}

export function clearSavedDocument() {
  window.localStorage.removeItem(STORAGE_KEY)
}
