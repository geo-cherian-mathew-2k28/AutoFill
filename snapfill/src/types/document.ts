export type DocumentType = 'aadhaar' | 'pan' | 'driving-license' | 'generic'

export type FieldKey = 'fullName' | 'dateOfBirth' | 'documentNumber' | 'address' | 'guardianName' | 'validUntil'

export interface ExtractedField {
  key: FieldKey
  label: string
  value: string
  confidence: number
}

export interface ExtractedDocument {
  id: string
  type: DocumentType
  displayName: string
  source: 'demo' | 'upload'
  fields: ExtractedField[]
  scannedAt: string
}
