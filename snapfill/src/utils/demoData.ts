import type { DocumentType, ExtractedDocument } from '@/types/document'

const demoDocuments: Record<Exclude<DocumentType, 'generic'>, ExtractedDocument> = {
  aadhaar: {
    id: 'demo-aadhaar',
    type: 'aadhaar',
    displayName: 'Aadhaar card',
    source: 'demo',
    scannedAt: 'Just now',
    fields: [
      { key: 'fullName', label: 'Full name', value: 'Arjun Nair', confidence: 99 },
      { key: 'dateOfBirth', label: 'Date of birth', value: '14/08/2001', confidence: 98 },
      { key: 'documentNumber', label: 'Aadhaar number', value: '6248 3157 9026', confidence: 99 },
      { key: 'address', label: 'Address', value: 'Kakkanad, Kochi, Kerala 682030', confidence: 94 },
    ],
  },
  pan: {
    id: 'demo-pan',
    type: 'pan',
    displayName: 'PAN card',
    source: 'demo',
    scannedAt: 'Just now',
    fields: [
      { key: 'fullName', label: 'Full name', value: 'Arjun Nair', confidence: 99 },
      { key: 'guardianName', label: "Father's name", value: 'Ravi Nair', confidence: 97 },
      { key: 'dateOfBirth', label: 'Date of birth', value: '14/08/2001', confidence: 98 },
      { key: 'documentNumber', label: 'PAN number', value: 'DPNPK4821M', confidence: 99 },
    ],
  },
  'driving-license': {
    id: 'demo-license',
    type: 'driving-license',
    displayName: 'Driving licence',
    source: 'demo',
    scannedAt: 'Just now',
    fields: [
      { key: 'fullName', label: 'Full name', value: 'Arjun Nair', confidence: 98 },
      { key: 'dateOfBirth', label: 'Date of birth', value: '14/08/2001', confidence: 96 },
      { key: 'documentNumber', label: 'Licence number', value: 'KL-07-20190045281', confidence: 98 },
      { key: 'validUntil', label: 'Valid until', value: '13/08/2041', confidence: 95 },
    ],
  },
}

export function getDemoDocument(type: Exclude<DocumentType, 'generic'>): ExtractedDocument {
  const document = demoDocuments[type]
  return {
    ...document,
    fields: document.fields.map((field) => ({ ...field })),
  }
}
