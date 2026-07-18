import { ShieldCheck } from 'lucide-react'

export function PrivacyBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-left shadow-panel" role="status">
      <ShieldCheck className="shrink-0 text-emerald-500" size={20} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-emerald-700">Local Processing Enabled</p>
        <p className="text-xs text-emerald-800">Your documents never leave this device.</p>
      </div>
    </div>
  )
}
