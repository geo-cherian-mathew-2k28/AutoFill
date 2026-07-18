export interface AgentProfile {
  [key: string]: string
}

export interface AgentFillResult {
  filled: number
  total: number
  hostname: string
  strategy: 'ai' | 'heuristic' | 'local-recipe'
}

interface BridgeResponse<T> {
  channel: 'snapfill-agent-response'
  requestId: string
  ok: boolean
  data?: T
  error?: string
}

export function fillWithLocalAgent(url: string, profile: AgentProfile, document: { id: string; displayName: string }, includeOptional: boolean) {
  const requestId = crypto.randomUUID()

  return new Promise<AgentFillResult>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', receive)
      reject(new Error('SnapFill Agent was not detected. Load or reload the local browser extension, then try again.'))
    }, 5000)

    function receive(event: MessageEvent<unknown>) {
      if (event.source !== window || event.origin !== window.location.origin) return
      const response = event.data as BridgeResponse<AgentFillResult>
      if (response?.channel !== 'snapfill-agent-response' || response.requestId !== requestId) return
      window.clearTimeout(timeout)
      window.removeEventListener('message', receive)
      if (response.ok && response.data) resolve(response.data)
      else reject(new Error(response.error ?? 'The local agent could not fill this form.'))
    }

    window.addEventListener('message', receive)
    window.postMessage({
      channel: 'snapfill-agent-request',
      requestId,
      type: 'webAgentFill',
      payload: { url, profile, document, includeOptional },
    }, window.location.origin)
  })
}
